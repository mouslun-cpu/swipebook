import { Dungeon } from './types';

export const DUNGEONS: Dungeon[] = [
  {
    id: 'dungeon-001',
    title: '⚔️ 新手村：正常餘額直覺挑戰',
    description: '訓練五大會計要素增加時，記借還是記貸的反射神經！',
    leftLabel: '👈 借',
    rightLabel: '貸 👉',
    questions: [
      { id: 'q1-1', text: '現金增加', answer: 'debit', hint: '資產增加 → 借方' },
      { id: 'q1-2', text: '應付帳款增加', answer: 'credit', hint: '負債增加 → 貸方' },
      { id: 'q1-3', text: '銷貨收入發生', answer: 'credit', hint: '收益發生 → 貸方' },
      { id: 'q1-4', text: '薪資費用發生', answer: 'debit', hint: '費用發生 → 借方' },
      { id: 'q1-5', text: '股本增加', answer: 'credit', hint: '股東權益增加 → 貸方' },
      { id: 'q1-6', text: '預付租金增加', answer: 'debit', hint: '資產增加 → 借方' },
    ],
  },
  {
    id: 'dungeon-002',
    title: '⚔️ 進貨大亨：買賣業會計循環',
    description: '熟悉永續盤存制下的進銷貨交易與折讓！',
    leftLabel: '👈 借',
    rightLabel: '貸 👉',
    questions: [
      { id: 'q2-1', text: '向廠商賒購商品，請問「存貨」要放哪？', answer: 'debit', hint: '採購存貨，資產增加 → 借方' },
      { id: 'q2-2', text: '承上題，請問「應付帳款」要放哪？', answer: 'credit', hint: '賒購欠廠商錢，負債增加 → 貸方' },
      { id: 'q2-3', text: '顧客來店用現金買衣服，請問「銷貨收入」要放哪？', answer: 'credit', hint: '收益發生 → 貸方' },
      { id: 'q2-4', text: '承上題（永續盤存制），請問「銷貨成本」要放哪？', answer: 'debit', hint: '費用發生 → 借方' },
      { id: 'q2-5', text: '承上題，賣出衣服的「存貨」要放哪？', answer: 'credit', hint: '資產減少 → 貸方' },
      { id: 'q2-6', text: '發現進貨商品有瑕疵，退回給廠商，請問「存貨」要放哪？', answer: 'credit', hint: '退貨，存貨減少 → 貸方' },
    ],
  },
  {
    id: 'dungeon-003',
    title: '⚔️ 期末審判：虛實帳戶大清洗',
    description: '結帳時，將虛帳戶結清歸零的反射訓練！',
    leftLabel: '👈 借方結清',
    rightLabel: '貸方結清 👉',
    questions: [
      { id: 'q3-1', text: '年底要把「銷貨收入」結清，請問結帳分錄中「銷貨收入」要放哪？', answer: 'debit', hint: '原為貸方餘額，用借方抵銷 → 借方結清' },
      { id: 'q3-2', text: '年底要把「租金費用」結清，請問「租金費用」要放哪？', answer: 'credit', hint: '原為借方餘額，用貸方抵銷 → 貸方結清' },
      { id: 'q3-3', text: '年底要把「銷貨退回」結清，請問「銷貨退回」要放哪？', answer: 'credit', hint: '原為借方餘額，用貸方抵銷 → 貸方結清' },
      {
        id: 'q3-4',
        text: '⚠️ (陷阱題) 年底要把「預收收入」結清，請問放哪？',
        answer: 'trap',
        hint: '陷阱！「預收收入」是負債，屬於實帳戶，不需要結清！',
      },
    ],
  },
];
