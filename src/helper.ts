export async function download(targetUrl: string, fileName: string) {
  const response = await fetch(targetUrl);
  const data = await response.text();
  const blob = new Blob([data]);
  const element = document.createElement("a");
  element.href = window.URL.createObjectURL(blob);
  element.setAttribute("download", fileName);
  document.body.appendChild(element);
  element.click();
  element.remove();
}

export function copy(text: string) {
  navigator.clipboard.writeText(text);
}

export async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}
