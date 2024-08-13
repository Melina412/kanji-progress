import fs from 'fs';
import { Request, Response } from 'express';

// daten aus duolingo user api
import duolingoData from '../data/duolingoUserApi.json';
import rtkDeck from '../data/deck.json';
import kanjiData from '../data/kanji.json';

const units = duolingoData?.alphabets[2].groups;
console.log('units[0]', units[0]);

function getData() {
  const data = units.map((unit) => {
    const title = unit.title;
    const subtitle = unit.subtitle;
    const kanji = unit.characters
      .flatMap((group) => group.map((item) => (item ? item.character : null)))
      .filter((char) => char); // filtern der null werte
    return { title, subtitle, kanji };
  });
  console.log(data[5]);
  return data;
}

const duolingoKanji = getData();
// console.log({duolingoKanji});

async function writeData() {
  fs.writeFile(
    '../backend/src/data/duolingoKanji.json',
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

function printFields() {
  const fields = rtkDeck?.note_models[0].flds;

  const fieldNames = fields?.map((obj) => {
    return { name: obj.name, order: obj.ord };
  });
  // console.log({ fieldNames });

  let result: string[] = [];
  fieldNames?.forEach((obj) => {
    result[obj.order] = obj.name;
  });
  // console.log({ result });
  return result;
}

const orderedFieldNames = printFields();
// console.log({ orderedFieldNames });
