// UserPromptSubmit hook - reminds Claude that the user's personal default
// automation stack is Playwright + TypeScript, whenever the prompt looks
// like a request to write/generate an automation script. This is a personal
// preference tracked outside CLAUDE.md (which still lists multiple stacks
// for the whole team) - see conversation where user asked not to edit the
// shared file for this.
let data = '';
process.stdin.on('data', (chunk) => { data += chunk; });
process.stdin.on('end', () => {
  let prompt = '';
  try {
    prompt = (JSON.parse(data).prompt || '').toLowerCase();
  } catch (e) {
    process.stdout.write('{}');
    return;
  }

  const keywords = [
    'script', 'automation', 'playwright', 'selenium', 'appium', 'rest assured',
    'test case', 'testcase', 'tự động', 'viết test', 'sinh test', 'sinh code',
    'viết script', 'sinh script', 'tạo script', 'generate test', 'write test'
  ];

  if (keywords.some((k) => prompt.includes(k))) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: '[User preference - khong phai rule chung ca team] Stack automation mac dinh cua user nay la Playwright + TypeScript. KHONG dung Java/Selenium/Appium/REST Assured tru khi user yeu cau ro rang mot stack khac, du CLAUDE.md van liet ke nhieu stack ho tro cho ca team.'
      }
    }));
  } else {
    process.stdout.write('{}');
  }
});
