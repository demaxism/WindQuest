export class QuestPattern {
  // only sembo
  semboId:string;
  // land and sembo
  landId:string;
  sembos:string[];
}

export class Quest {
  name:string;
  patterns:QuestPattern[];
}