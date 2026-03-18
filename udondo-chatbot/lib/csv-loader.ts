import fs from 'fs';
import path from 'path';

/**
 * CSVデータを解析して配列として返す
 */
export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    if (line.trim()) {
      // シンプルなCSVパース（カンマ区切り）
      const values = line.split(',').map(v => v.trim());
      result.push(values);
    }
  }

  return result;
}

/**
 * knowledge.csvを読み込んで全データを文字列として返す
 */
export function loadKnowledgeBase(): string {
  try {
    const filePath = path.join(process.cwd(), 'knowledge.csv');
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    return csvContent;
  } catch (error) {
    console.error('Error loading knowledge.csv:', error);
    return '';
  }
}

/**
 * knowledge.csvを読み込んでパース済みの配列として返す
 */
export function loadKnowledgeBaseArray(): string[][] {
  const csvContent = loadKnowledgeBase();
  if (!csvContent) {
    return [];
  }
  return parseCSV(csvContent);
}

/**
 * CSVデータを整形してプロンプトに使いやすい形式で返す
 */
export function formatKnowledgeBaseForPrompt(): string {
  const data = loadKnowledgeBaseArray();
  if (data.length === 0) {
    return 'ナレッジベースが見つかりません。';
  }

  // ヘッダー行を取得
  const headers = data[0];
  
  // データ行を整形
  const formattedData = data.slice(1).map((row, index) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return `[エントリー ${index + 1}]
${Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join('\n')}
`;
  }).join('\n');

  return formattedData;
}
