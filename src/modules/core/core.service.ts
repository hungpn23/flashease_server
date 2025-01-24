import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import XLSX from 'xlsx';
import { CardDto } from './dtos/card.dto';

@Injectable()
export class CoreService {
  convertFromText(input: string) {
    const cards = input.trim().split('\n');
    const results: CardDto[] = cards
      .map((card) => {
        const [term, definition] = card.split(':');
        if (!term || !definition) return;
        return { term, definition };
      })
      .filter((card) => card !== undefined);

    return plainToInstance(CardDto, results);
  }

  convertFromXlsx(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const results: CardDto[] = data
      .slice(2)
      .map((row) => ({
        term: row[0],
        definition: row[1],
      }))
      .filter(
        (item) => item.term !== undefined || item.definition !== undefined,
      );

    return plainToInstance(CardDto, results);
  }
}
