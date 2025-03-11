import { Role } from '@/constants';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { VisibleTo } from '@/modules/set/set.enum';
import { UserEntity } from '@/modules/user/entities/user.entity';
import argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  async run(
    _dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const users = await this.seedUsers();
    await this.seedSets(users);
  }

  private async seedSets(users: UserEntity[]) {
    const [hungpn23, andy, red, rust, martin] = users;

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 19 - Test 3: Passage 2',
        description: 'Tập hợp từ vựng về môi trường và sinh thái',
        author: hungpn23.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 20 - Test 4: Passage 1',
        description: 'Các từ vựng chuyên ngành trong bài đọc IELTS',
        author: hungpn23.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSCODE,
        passcode: 'passcode',
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 21 - Test 2: Passage 3',
        description: 'Tập hợp từ vựng nâng cao cho luyện thi IELTS',
        author: hungpn23.username,
        visibleTo: VisibleTo.JUST_ME,
        passcode: null,
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading Cambridge 18 - Test 3',
        description: 'Danh sách từ vựng cơ bản cho IELTS Reading',
        author: andy.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: andy.id,
        user: andy,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading Cambridge 19 - Test 1',
        description: 'Các từ vựng khó trong phần đọc IELTS',
        author: andy.username,
        visibleTo: VisibleTo.JUST_ME,
        passcode: null,
        createdBy: andy.id,
        user: andy,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 22 - Test 2: Passage 1',
        description: 'Tập hợp các thuật ngữ trong đọc hiểu IELTS',
        author: red.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: red.id,
        user: red,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 23 - Test 5: Passage 4',
        description: 'Bộ từ vựng chuyên sâu dành cho kỳ thi IELTS',
        author: red.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSCODE,
        passcode: 'passcode',
        createdBy: red.id,
        user: red,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading 24 - Test 3: Passage 3',
        description: 'Các từ vựng thường gặp trong phần đọc IELTS',
        author: rust.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: rust.id,
        user: rust,
        cards: this.getRandomCards(),
      }),
    ]);

    await SetEntity.save([
      new SetEntity({
        name: 'Từ vựng IELTS Reading Cambridge 20 - Test 2',
        description: 'Danh sách từ vựng thiết yếu cho IELTS Reading',
        author: martin.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: martin.id,
        user: martin,
        cards: this.getRandomCards(),
      }),
    ]);
  }

  private async seedUsers() {
    const [hungpn23, andy, forrest, cooper, murphy] = await UserEntity.save([
      new UserEntity({
        username: 'hungpn23',
        email: 'hungpn23@gmail.com',
        isEmailVerified: true,
        password: await argon2.hash('password'),
        role: Role.ADMIN,
      }),
      new UserEntity({
        username: 'andy_dufresne', // tối thiểu 6 ký tự
        email: 'andy@gmail.com',
        bio: 'Chuyên gia thiết kế giao diện và phát triển frontend.',
        password: await argon2.hash('password'),
      }),
      new UserEntity({
        username: 'forrest_gump',
        email: 'forrest@gmail.com',
        bio: 'Nhà phát triển full-stack với đam mê công nghệ mới.',
        password: await argon2.hash('password'),
      }),
      new UserEntity({
        username: 'cooper',
        email: 'cooper@gmail.com',
        bio: 'Kỹ sư phần mềm với kinh nghiệm đa dạng về hệ thống.',
        password: await argon2.hash('password'),
      }),
      new UserEntity({
        username: 'murphy',
        email: 'murphy@gmail.com',
        bio: 'Kiến trúc sư hệ thống, yêu thích học hỏi và đổi mới.',
        password: await argon2.hash('password'),
      }),
    ]);

    return [hungpn23, andy, forrest, cooper, murphy];
  }

  // Hàm tạo danh sách card ngẫu nhiên (từ 10 đến 30 card) với các từ tiếng Anh ít gặp và định nghĩa bằng tiếng Việt.
  private getRandomCards(): CardEntity[] {
    const rareWords = [
      { term: 'aberration', definition: 'sự lệch lạc, lệch chuẩn' },
      {
        term: 'acquiesce',
        definition: 'chịu đựng, đồng thuận mặc dù không hứng thú',
      },
      { term: 'alacrity', definition: 'sự nhanh nhẹn, sẵn lòng' },
      { term: 'anomaly', definition: 'điều bất thường' },
      { term: 'antithesis', definition: 'điều đối lập, nghịch lý' },
      { term: 'arcane', definition: 'bí ẩn, huyền bí' },
      { term: 'ascetic', definition: 'khổ hạnh, giản dị' },
      { term: 'cacophony', definition: 'âm thanh hỗn loạn' },
      { term: 'capitulate', definition: 'đầu hàng, chịu thua' },
      { term: 'catharsis', definition: 'sự giải tỏa cảm xúc' },
      { term: 'circumspect', definition: 'cẩn trọng, thận trọng' },
      { term: 'conundrum', definition: 'vấn đề nan giải, câu đố' },
      { term: 'demagogue', definition: 'lãnh tụ mưu đồ, kẻ kích động' },
      { term: 'didactic', definition: 'giáo huấn, có tính chất giảng dạy' },
      { term: 'efficacy', definition: 'hiệu quả, tác dụng' },
      { term: 'ephemeral', definition: 'tạm thời, phù du' },
      { term: 'equanimity', definition: 'sự điềm tĩnh, bình thản' },
      {
        term: 'esoteric',
        definition: 'bí mật, chỉ hiểu được bởi một nhóm người',
      },
      { term: 'fastidious', definition: 'kén chọn, khó tính' },
      { term: 'fortuitous', definition: 'ngẫu nhiên, tình cờ' },
      { term: 'gregarious', definition: 'ham giao lưu, hòa đồng' },
      {
        term: 'iconoclast',
        definition: 'người chống lại các giá trị truyền thống',
      },
      { term: 'idiosyncratic', definition: 'đặc trưng cá nhân, riêng lạ' },
      { term: 'intransigent', definition: 'cứng đầu, không khoan nhượng' },
      { term: 'loquacious', definition: 'nói nhiều, lắm lời' },
      { term: 'mellifluous', definition: 'ngọt ngào, trôi chảy' },
      { term: 'obfuscate', definition: 'làm rối, làm mờ' },
      { term: 'perfunctory', definition: 'vội vàng, qua loa' },
      { term: 'quixotic', definition: 'lãng mạn, phi thực tế' },
      { term: 'recalcitrant', definition: 'bướng bỉnh, không chịu tuân theo' },
      { term: 'recondite', definition: 'khó hiểu, uyên bác' },
      { term: 'sagacious', definition: 'khôn ngoan, tinh tường' },
      { term: 'salubrious', definition: 'tốt cho sức khỏe, lành mạnh' },
      { term: 'sanguine', definition: 'lạc quan, vui vẻ' },
      { term: 'serendipity', definition: 'sự tình cờ may mắn' },
      { term: 'surreptitious', definition: 'bí mật, lén lút' },
      { term: 'tantamount', definition: 'tương đương, ngang nhau' },
      { term: 'trenchant', definition: 'sắc bén, có tính phân tích sâu sắc' },
      { term: 'ubiquitous', definition: 'phổ biến, hiện diện khắp nơi' },
      { term: 'umbrage', definition: 'sự phật nộ, bị xúc phạm' },
      { term: 'unprecedented', definition: 'chưa từng có, chưa từng xảy ra' },
      { term: 'vicissitude', definition: 'sự thay đổi, thăng trầm' },
      { term: 'vindicate', definition: 'biện minh, chứng minh sự đúng đắn' },
      { term: 'virulent', definition: 'độc hại, hung dữ' },
      { term: 'wheedle', definition: 'nịnh hót, xu nịnh' },
      { term: 'zealous', definition: 'nhiệt tình, hăng hái' },
      { term: 'abstruse', definition: 'khó hiểu, tinh vi' },
      { term: 'acerbic', definition: 'chua chát, cay cú' },
      { term: 'acumen', definition: 'sự tinh tường, sự sắc bén' },
      { term: 'adumbrate', definition: 'phác họa một cách mơ hồ' },
      { term: 'aegis', definition: 'sự bảo hộ, che chở' },
      { term: 'affable', definition: 'thân thiện, dễ gần' },
      { term: 'aggrandize', definition: 'làm cho vĩ đại, phóng đại' },
      { term: 'allegory', definition: 'ẩn dụ, dụ ngôn' },
      { term: 'anfractuous', definition: 'rắc rối, phức tạp' },
      { term: 'antipathy', definition: 'sự thù địch, phản cảm' },
      { term: 'apocryphal', definition: 'không xác thực, hoài nghi' },
      { term: 'approbation', definition: 'sự tán thành, khen ngợi' },
      { term: 'ascendancy', definition: 'sự thống trị, ưu thế' },
      { term: 'asperity', definition: 'sự gian nan, khắc nghiệt' },
      { term: 'assiduous', definition: 'siêng năng, cần cù' },
      { term: 'atrophy', definition: 'sự teo cơ, suy giảm' },
      { term: 'avarice', definition: 'tham lam, lòng tham' },
      { term: 'belligerent', definition: 'hiếu chiến, ưa giao tranh' },
      { term: 'benediction', definition: 'lời chúc lành, phước lành' },
      { term: 'bereft', definition: 'bị mất, thiếu thốn' },
      { term: 'blandishment', definition: 'sự tâng bốc, nịnh hót' },
      { term: 'boon', definition: 'lợi ích, phước lành' },
      { term: 'brazen', definition: 'trơ trẽn, không biết xấu hổ' },
      { term: 'burgeon', definition: 'phát triển nhanh, nở rộ' },
      { term: 'callous', definition: 'vô cảm, cứng lòng' },
      { term: 'capricious', definition: 'bất ổn, thay đổi thất thường' },
      { term: 'castigate', definition: 'trừng phạt, chê trách gay gắt' },
      { term: 'caustic', definition: 'chát, châm chọc' },
      { term: 'censure', definition: 'sự lên án, chỉ trích' },
      { term: 'chicanery', definition: 'sự lừa dối, mưu mẹo' },
      { term: 'clamor', definition: 'tiếng ồn, sự kêu gọi' },
      { term: 'cogent', definition: 'súc tích, thuyết phục' },
      { term: 'commensurate', definition: 'tương xứng, phù hợp' },
      { term: 'compunction', definition: 'sự ăn năn, hối hận' },
      { term: 'conflagration', definition: 'đại hoại, cháy dữ' },
      { term: 'corroborate', definition: 'xác nhận, làm cho chắc chắn' },
      { term: 'cursory', definition: 'vừa qua, qua loa' },
      { term: 'dearth', definition: 'sự thiếu hụt, khan hiếm' },
      { term: 'debacle', definition: 'sự sụp đổ, thảm họa' },
      { term: 'decorum', definition: 'sự chỉnh đốn, lễ nghi' },
      { term: 'deference', definition: 'sự tôn trọng, kính trọng' },
      { term: 'deleterious', definition: 'có hại, gây hại' },
      { term: 'demure', definition: 'khiêm tốn, kín đáo' },
      { term: 'deride', definition: 'cười nhạo, chế nhạo' },
    ];
    const count = Math.floor(Math.random() * 21) + 10;
    const shuffled = rareWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(
      (word) =>
        new CardEntity({
          term: word.term,
          definition: word.definition,
          correctCount: null,
        }),
    );
  }
}
