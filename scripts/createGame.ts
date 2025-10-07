import { connectDB } from "../db/dbconnect";
import { Game } from "../models/Game";

const games = [
  // ===== ยิงปืน =====
  {
    title: "Call of Duty: Modern Warfare",
    price: 1899,
    category: "ยิงปืน",
    imageUrl:
      "https://image.api.playstation.com/vulcan/ap/rnd/202212/1917/OS18LBxAVpQ1iPeGWAqSnxem.png",
    description: "เกมยิงปืน FPS ระดับโลก",
    releaseDate: new Date("2020-10-25"),
    salesCount: 15420,
  },
  {
    title: "Battlefield 2042",
    price: 1799,
    category: "ยิงปืน",
    imageUrl:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1517290/capsule_616x353.jpg?t=1755529340",
    description: "สงครามใหญ่ 128 ผู้เล่น",
    releaseDate: new Date("2021-11-19"),
    salesCount: 11200,
  },
  {
    title: "Overwatch 2",
    price: 1199,
    category: "ยิงปืน",
    imageUrl:
      "https://www.ggkeystore.com/cdn-cgi/image/fit=scale-down,w=1920,q=85,f=auto,anim=false,sharpen=0,onerror=redirect,metadata=none/storage/articles/UpYjllO7afm3C87mnXMwuVkaqK20cVfvMD5ywiSL.jpeg?md-1666450944",
    description: "เกมยิงทีมแนว FPS",
    releaseDate: new Date("2023-12-22"),
    salesCount: 9800,
  },
  {
    title: "Counter Strike: Global Offensive",
    price: 699,
    category: "ยิงปืน",
    imageUrl:
      "https://cdn.oneesports.co.th/cdn-data/sites/3/2023/03/E2C054CA-18D6-4AB9-9E15-9589F1310709.jpeg",
    description: "เกมยิงปืนแบบทีมยอดนิยม",
    releaseDate: new Date("2012-08-21"),
    salesCount: 25000,
  },

  // ===== เอาชีวิตรอด =====
  {
    title: "Minecraft",
    price: 899,
    category: "เอาชีวิตรอด",
    imageUrl:
      "https://image.api.playstation.com/vulcan/ap/rnd/202407/0401/670c294ded3baf4fa11068db2ec6758c63f7daeb266a35a1.png",
    description: "สร้างโลกและเอาชีวิตรอด",
    releaseDate: new Date("2011-11-18"),
    salesCount: 200000,
  },
  {
    title: "ARK: Survival Evolved",
    price: 1399,
    category: "เอาชีวิตรอด",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/ArkSurvivalEvolved.png/250px-ArkSurvivalEvolved.png",
    description: "เอาชีวิตรอดในโลกไดโนเสาร์",
    releaseDate: new Date("2017-08-29"),
    salesCount: 8500,
  },
  {
    title: "The Forest",
    price: 1299,
    category: "เอาชีวิตรอด",
    imageUrl:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg",
    description: "เอาชีวิตรอดในป่าลึกลับ",
    releaseDate: new Date("2018-05-30"),
    salesCount: 6400,
  },
  {
    title: "Rust",
    price: 1399,
    category: "เอาชีวิตรอด",
    imageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg?t=1747389753",
    description: "เอาชีวิตรอดแบบออนไลน์",
    releaseDate: new Date("2018-02-08"),
    salesCount: 7800,
  },

  // ===== รถแข่ง =====
  {
    title: "Forza Horizon 5",
    price: 1799,
    category: "รถแข่ง",
    imageUrl:
      "https://store-images.s-microsoft.com/image/apps.28758.13734397844529069.202e3fc9-37d6-4853-a58b-fabe504b71e8.4335e940-f927-4be4-af08-8e689a17bd7a",
    description: "เกมแข่งรถโลกเปิด",
    releaseDate: new Date("2021-11-09"),
    salesCount: 12000,
  },
  {
    title: "F1 2023",
    price: 1699,
    category: "รถแข่ง",
    imageUrl:
      "https://media.contentapi.ea.com/content/dam/ea/f1/f1-23/common/featured-image/f123-featured-image-16x9.jpg.adapt.crop191x100.1200w.jpg",
    description: "เกมแข่งรถสูตรหนึ่ง",
    releaseDate: new Date("2023-07-21"),
    salesCount: 7600,
  },
  {
    title: "Need for Speed: Heat",
    price: 1499,
    category: "รถแข่ง",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5a7WZ-ibHwuJQM90wczY8EaKP6JdY9aM6KQ&s",
    description: "เกมแข่งรถถนนและซิ่ง",
    releaseDate: new Date("2019-11-08"),
    salesCount: 8900,
  },
  {
    title: "Gran Turismo 7",
    price: 1799,
    category: "รถแข่ง",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQwSZNCISBGFupS3AU21UeC_d_Jvvqvr-a0A&s",
    description: "เกมแข่งรถสมจริง",
    releaseDate: new Date("2022-03-04"),
    salesCount: 10200,
  },

  // ===== ทำสวน =====
  {
    title: "Stardew Valley",
    price: 699,
    category: "ทำสวน",
    imageUrl:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/capsule_616x353.jpg?t=1754692865",
    description: "เกมทำฟาร์มและชีวิตในชนบท",
    releaseDate: new Date("2016-02-26"),
    salesCount: 14000,
  },
  {
    title: "Farming Simulator 22",
    price: 1299,
    category: "ทำสวน",
    imageUrl:
      "https://store-images.s-microsoft.com/image/apps.63069.13516489167520418.22b76ab9-a8f0-4921-9cf6-55645b8540e5.b17ecc68-fa18-4d1f-91dc-d8c2b714b9be?q=90&w=480&h=270",
    description: "จำลองการทำฟาร์มครบวงจร",
    releaseDate: new Date("2021-11-22"),
    salesCount: 9500,
  },
  {
    title: "Garden Paws",
    price: 799,
    category: "ทำสวน",
    imageUrl:
      "https://assets.nintendo.com/image/upload/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70010000014109/4fa959c23340deca62e2e54a78779a240cb6bf503154f465ab887785b77e7f73",
    description: "เกมทำสวนและร้านค้า",
    releaseDate: new Date("2020-09-17"),
    salesCount: 4800,
  },
  {
    title: "Terraria",
    price: 499,
    category: "ทำสวน",
    imageUrl:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg?t=1731252354",
    description: "เกมสร้างโลกและปลูกผัก",
    releaseDate: new Date("2011-05-16"),
    salesCount: 22000,
  },

  // ===== แฟนตาซี =====
  {
    title: "The Witcher 3: Wild Hunt",
    price: 999,
    category: "แฟนตาซี",
    imageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/ad9240e088f953a84aee814034c50a6a92bf4516/header.jpg?t=1749199563",
    description: "ผจญภัยแฟนตาซีในโลกกว้าง",
    releaseDate: new Date("2015-05-19"),
    salesCount: 45680,
  },
  {
    title: "Elden Ring",
    price: 1899,
    category: "แฟนตาซี",
    imageUrl:
      "https://image.api.playstation.com/vulcan/ap/rnd/202108/0410/D8mYIXWja8knuqYlwqcqVpi1.jpg",
    description: "แฟนตาซี RPG โลกเปิด",
    releaseDate: new Date("2022-02-25"),
    salesCount: 22150,
  },
];

const importGames = async () => {
  try {
    await connectDB();

    // ลบเกมเก่าก่อน import (optional)
    await Game.deleteMany({});
    console.log("✅ ลบเกมเก่าเรียบร้อย");

    // Import เกมใหม่
    await Game.insertMany(games);
    console.log("✅ นำเข้าเกม 20 เกมสำเร็จ");

    process.exit();
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err);
    process.exit(1);
  }
};

importGames();
