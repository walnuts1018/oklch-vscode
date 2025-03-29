import * as vscode from 'vscode';
import { parse } from 'culori';

export class DocumentLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();
    const regex = /(oklch\(.+\))/g;
    const matchList = text.matchAll(regex);
    for (const match of matchList) {
      const startPosition = match.index;
      const endPosition = startPosition && (startPosition + match[0].length);
      if (startPosition === undefined || endPosition === undefined) {
        return [];
      }
      const range = new vscode.Range(document.positionAt(startPosition), document.positionAt(endPosition));
      const color = parse(match[0]);
      if (color?.mode === "oklch") {
        const url = `https://oklch.com/#${color.l},${color.c},${color.h || 0},${color.alpha || 100}`;
        links.push(new vscode.DocumentLink(range, vscode.Uri.parse(url)));
      }
    }
    return links;
  }
}
