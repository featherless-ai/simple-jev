const promptButton = document.getElementById('copy-agent-prompt');
let copyReset;
promptButton?.addEventListener('click', async () => {
  const prompt = document.getElementById('agent-quick-prompt');
  const status = document.getElementById('agent-copy-status');
  const label = promptButton.querySelector('.copy-label');
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(prompt.textContent);
    label.textContent = 'Copied!';
    promptButton.setAttribute('data-copied', '');
    status.textContent = 'Copied. Paste into your agent to get started.';
    copyReset = setTimeout(() => {
      label.textContent = 'Copy prompt';
      promptButton.removeAttribute('data-copied');
      status.textContent = 'Paste into your agent to get started.';
    }, 2500);
  } catch {
    label.textContent = 'Copy prompt';
    promptButton.removeAttribute('data-copied');
    const range = document.createRange(); range.selectNodeContents(prompt);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    prompt.focus(); status.textContent = 'Copy the selected prompt manually.';
  }
});
