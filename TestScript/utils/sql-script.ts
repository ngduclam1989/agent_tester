import { normalizeSql } from './db-client';

/** Kết quả tách 1 ô Script gồm 1 hoặc nhiều câu SELECT / WITH, ngăn cách bằng dấu ";". */
export interface ParsedScript {
    /** Các câu SELECT / WITH theo thứ tự trong ô Script, đã sẵn sàng chạy độc lập */
    statements: string[];
    /** Đoạn nằm ngoài mọi câu SELECT (vd "AND ..." đứng sau dấu ";", hoặc lời mô tả) */
    strayFragments: string[];
}

const isQuery = (sql: string): boolean => /^(select|with)\b/i.test(sql);

export function parseSqlScript(script: string): ParsedScript {
    const parts = normalizeSql(script.normalize('NFC'))
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part !== '');

    return {
        statements: shareCteClause(parts.filter(isQuery)),
        strayFragments: parts.filter((part) => !isQuery(part)),
    };
}

/** Lỗi khiến script không chạy được hoặc chạy ra kết quả sai — phát hiện trước khi gửi xuống DB. */
export function findScriptIssues(script: ParsedScript): string[] {
    const issues: string[] = [];
    if (script.statements.length === 0) {
        issues.push('Script không có câu SELECT / WITH nào');
    }
    for (const fragment of script.strayFragments) {
        issues.push(`Script sai cú pháp: đoạn nằm ngoài câu SELECT (sau dấu ";"): "${fragment.replace(/\s+/g, ' ').slice(0, 80)}"`);
    }
    if (script.statements.some((sql) => /\bFSI_D_x{2,}\b/i.test(sql))) {
        issues.push('Script còn tên bảng giữ chỗ FSI_D_xxx');
    }
    if (script.statements.some((sql) => /\bselect\s+\*\s+from\b/i.test(sql))) {
        issues.push('Script còn câu mẫu SELECT * (chưa viết điều kiện)');
    }
    return issues;
}

/** Bỏ nội dung nằm trong ngoặc để chỉ còn cấu trúc cấp ngoài cùng của câu lệnh. */
export function topLevelSql(sql: string): string {
    let depth = 0;
    let out = '';
    for (const ch of sql) {
        if (ch === '(') depth++;
        if (depth === 0) out += ch;
        if (ch === ')') depth = Math.max(0, depth - 1);
    }
    return out;
}

/**
 * Script dạng "WITH pre AS (...) SELECT ...; SELECT ... FROM pre;" khai báo CTE một lần ở câu đầu
 * rồi dùng lại ở các câu sau. Tách theo dấu ";" thì các câu sau mất CTE (ORA-00942),
 * nên chép khối WITH sang những câu có dùng tới nó.
 */
function shareCteClause(queries: string[]): string[] {
    const cte = queries.length > 1 ? extractCteClause(queries[0]) : undefined;
    if (!cte) {
        return queries;
    }
    return queries.map((sql, index) =>
        index > 0 && !/^with\b/i.test(sql) && cte.names.some((name) => new RegExp(`\\b${name}\\b`, 'i').test(sql))
            ? `${cte.text}\n${sql}`
            : sql,
    );
}

function extractCteClause(sql: string): { text: string; names: string[] } | undefined {
    if (!/^with\b/i.test(sql)) {
        return undefined;
    }
    const names: string[] = [];
    let pos = 'with'.length;
    for (;;) {
        const head = /^\s*(\w+)\s*(?:\([^)]*\))?\s+as\s*\(/i.exec(sql.slice(pos));
        if (!head) {
            return undefined;
        }
        names.push(head[1]);

        let index = pos + head[0].length;
        let depth = 1;
        while (index < sql.length && depth > 0) {
            if (sql[index] === '(') depth++;
            if (sql[index] === ')') depth--;
            index++;
        }
        if (depth !== 0) {
            return undefined;
        }

        const comma = /^\s*,/.exec(sql.slice(index));
        if (!comma) {
            return { text: sql.slice(0, index), names };
        }
        pos = index + comma[0].length;
    }
}
