import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const submissions = [
  {
    text: "Have you tried just drinking more water?",
    whoSaidIt: "My Doctor",
    whereSaid: "Doctor's Office",
    submitterName: null,
    reactions: { DID_NOT: 12, GOT_THIS_TOO: 234, AUDACITY: 45, SENDING_LOVE: 67 },
  },
  {
    text: "You have such a pretty face though",
    whoSaidIt: "A Family Member",
    whereSaid: "Family Dinner",
    submitterName: "Mia",
    reactions: { DID_NOT: 89, GOT_THIS_TOO: 412, AUDACITY: 156, SENDING_LOVE: 203 },
  },
  {
    text: "I'm just saying this because I care about you",
    whoSaidIt: "A Coworker",
    whereSaid: "At Work",
    submitterName: null,
    reactions: { DID_NOT: 34, GOT_THIS_TOO: 189, AUDACITY: 78, SENDING_LOVE: 45 },
  },
  {
    text: "Have you considered that maybe you just need to eat less and move more?",
    whoSaidIt: "My Doctor",
    whereSaid: "Doctor's Office",
    submitterName: "Jordan",
    reactions: { DID_NOT: 156, GOT_THIS_TOO: 567, AUDACITY: 234, SENDING_LOVE: 112 },
  },
  {
    text: "You'd be so hot if you just lost like 30 pounds",
    whoSaidIt: "Someone I was Dating",
    whereSaid: "On a Date",
    submitterName: null,
    reactions: { DID_NOT: 201, GOT_THIS_TOO: 145, AUDACITY: 389, SENDING_LOVE: 178 },
  },
  {
    text: "Should you really be eating that?",
    whoSaidIt: "A Stranger",
    whereSaid: "Grocery Store",
    submitterName: "Sam",
    reactions: { DID_NOT: 67, GOT_THIS_TOO: 523, AUDACITY: 201, SENDING_LOVE: 89 },
  },
  {
    text: "My cousin did keto and lost 80 pounds. I can send you the link?",
    whoSaidIt: "A Friend",
    whereSaid: "Family Dinner",
    submitterName: null,
    reactions: { DID_NOT: 45, GOT_THIS_TOO: 378, AUDACITY: 112, SENDING_LOVE: 34 },
  },
  {
    text: "You're so brave for wearing that",
    whoSaidIt: "A Stranger",
    whereSaid: "Just Existing in Public",
    submitterName: "Lex",
    reactions: { DID_NOT: 178, GOT_THIS_TOO: 289, AUDACITY: 267, SENDING_LOVE: 145 },
  },
  {
    text: "I didn't think they made that in your size",
    whoSaidIt: "A Coworker",
    whereSaid: "At Work",
    submitterName: null,
    reactions: { DID_NOT: 234, GOT_THIS_TOO: 156, AUDACITY: 345, SENDING_LOVE: 89 },
  },
  {
    text: "But don't you want to be healthy? For your kids?",
    whoSaidIt: "A Family Member",
    whereSaid: "Family Dinner",
    submitterName: "Priya",
    reactions: { DID_NOT: 56, GOT_THIS_TOO: 445, AUDACITY: 189, SENDING_LOVE: 267 },
  },
  {
    text: "You know, swimming is great exercise for bigger people because it's low impact",
    whoSaidIt: "A Stranger",
    whereSaid: "At the Gym",
    submitterName: null,
    reactions: { DID_NOT: 89, GOT_THIS_TOO: 201, AUDACITY: 167, SENDING_LOVE: 56 },
  },
  {
    text: "I just think if you really wanted to change, you would have by now",
    whoSaidIt: "A Friend",
    whereSaid: "Online",
    submitterName: "Taylor",
    reactions: { DID_NOT: 145, GOT_THIS_TOO: 312, AUDACITY: 234, SENDING_LOVE: 178 },
  },
  {
    text: "Have you talked to your doctor about Ozempic? My neighbor's dog walker's sister lost SO much weight",
    whoSaidIt: "An Internet Person",
    whereSaid: "Online",
    submitterName: null,
    reactions: { DID_NOT: 112, GOT_THIS_TOO: 467, AUDACITY: 189, SENDING_LOVE: 67 },
  },
  {
    text: "No offense but I usually don't date bigger girls. You're the exception though!",
    whoSaidIt: "Someone I was Dating",
    whereSaid: "On a Date",
    submitterName: "Ava",
    reactions: { DID_NOT: 289, GOT_THIS_TOO: 178, AUDACITY: 456, SENDING_LOVE: 234 },
  },
  {
    text: "Wow, you finished that whole plate! Good for you!",
    whoSaidIt: "A Family Member",
    whereSaid: "Family Dinner",
    submitterName: null,
    reactions: { DID_NOT: 167, GOT_THIS_TOO: 345, AUDACITY: 278, SENDING_LOVE: 123 },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const s of submissions) {
    const submission = await prisma.submission.create({
      data: {
        text: s.text,
        whoSaidIt: s.whoSaidIt,
        whereSaid: s.whereSaid,
        submitterName: s.submitterName,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        ),
      },
    });

    // Create individual reaction records
    const reactionEntries: { submissionId: string; type: string }[] = [];
    for (const [type, count] of Object.entries(s.reactions)) {
      for (let i = 0; i < count; i++) {
        reactionEntries.push({ submissionId: submission.id, type });
      }
    }

    // Batch create reactions in chunks to avoid overwhelming SQLite
    const chunkSize = 500;
    for (let i = 0; i < reactionEntries.length; i += chunkSize) {
      await prisma.reaction.createMany({
        data: reactionEntries.slice(i, i + chunkSize),
      });
    }

    console.log(`  Created: "${s.text.slice(0, 50)}..." with ${reactionEntries.length} reactions`);
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
