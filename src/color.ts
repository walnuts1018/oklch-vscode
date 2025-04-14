import * as vscode from 'vscode';
import { formatCss, Oklch, parse } from 'culori';
import { converter } from 'culori';

export class DocumentColorProvider implements vscode.DocumentColorProvider {
  provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
    const colors: vscode.ColorInformation[] = [];
    const text = document.getText();
    const regex = /(oklch\(.+?\))/g;
    const matchList = text.matchAll(regex);
    for (const match of matchList) {
      const startPosition = match.index;
      const endPosition = startPosition && (startPosition + match[0].length);
      if (startPosition === undefined || endPosition === undefined) {
        return [];
      }
      const color = parse(match[0]);
      if (color?.mode === "oklch") {
        const rgba = converter('rgb')(color);
        const colorValue = new vscode.Color(rgba.r, rgba.g, rgba.b, rgba.alpha || 1);
        const range = new vscode.Range(document.positionAt(startPosition), document.positionAt(endPosition));
        colors.push(new vscode.ColorInformation(range, colorValue));
      }
    }
    return colors;
  }

  provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range },
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.ColorPresentation[]> {
    const oklch = this.roundOklch(
      converter('oklch')(
        {
          mode: "rgb",
          r: color.red,
          g: color.green,
          b: color.blue,
          alpha: color.alpha,
        }
      )
    );
    const str = formatCss(oklch);
    return [new vscode.ColorPresentation(str)];
  }

  roundOklch(base: Oklch): Oklch {
    return {
      mode: "oklch",
      l: Math.round(base.l * 100) / 100,
      c: Math.round(base.c * 10000) / 10000,
      h: base.h !== undefined ? Math.round(base.h * 100) / 100 : undefined,
      alpha: base.alpha !== undefined ? Math.round(base.alpha * 100) / 100 : undefined,
    };
  }
}
