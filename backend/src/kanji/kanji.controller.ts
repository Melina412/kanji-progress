import fs from 'fs';
import { Request, Response } from 'express';

// daten aus duolingo user api
import data from '../data/duolingoUserApi.json';

const units = data?.alphabets[2].groups;
// console.log('units[0]', units[0]);

function getData() {
  const data = units.map((unit) => {
    const title = unit.title;
    const kanji = unit.characters
      .flatMap((group) => group.map((item) => (item ? item.character : null)))
      .filter((char) => char); // filtern der null werte
    return { title, kanji };
  });
  // console.log(data[5]);
  return data;
}

const duolingoKanji = getData();
// console.log({duolingoKanji});

async function writeData() {
  fs.writeFile(
    './backend/src/data/duolingoKanji.json',
    JSON.stringify(duolingoKanji),
    'utf-8',
    (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('json file created successfully');
    }
  );
}
// writeData();

export async function getDuolingoKanji(req: Request, res: Response) {
  fs.readFile(
    '../backend/src/data/duolingoKanji.json',
    'utf-8',
    (error, data) => {
      if (error) {
        console.log('fehler beim lesen der json file', 'utf-8', error);
        return res.sendStatus(500);
      }
      console.log('data:', data);

      const parsed_data: Object = JSON.parse(data);
      console.log(parsed_data);
      return res.json({ data: parsed_data });
    }
  );
}

export async function findDuolingoKanji(req: Request, res: Response) {
  const kanji: string = '名';
  try {
    for (const element of duolingoKanji) {
      if (element.kanji.includes(kanji)) {
        return res.json(element.title);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
