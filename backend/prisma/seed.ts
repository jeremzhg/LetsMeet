import 'dotenv/config';
import { hashPassword } from '../src/services/bcrypt_service';
import { prisma, disconnectDB } from '../src/configs/db';
import { organizationsData, corporationsData, eventsData, packagesData } from './dummyData';

async function main() {

  await prisma.matchScore.deleteMany();
  await prisma.partners.deleteMany();
  await prisma.package.deleteMany();
  await prisma.events.deleteMany();
  await prisma.corporation.deleteMany();
  await prisma.organization.deleteMany();

  const hashedPassword = await hashPassword("password123");
  organizationsData.forEach(org => org.hashedPassword = hashedPassword);
  corporationsData.forEach(corp => corp.hashedPassword = hashedPassword);
  const createdOrgs: any[] = [];
  for (const o of organizationsData) {
    createdOrgs.push(await prisma.organization.create({ data: o }));
  }

  const createdCorps: any[] = [];
  for (const c of corporationsData) {
    createdCorps.push(await prisma.corporation.create({ data: c }));
  }

  const createdEvents: any[] = [];
  for (const e of eventsData) {
    const org = createdOrgs[Math.floor(Math.random() * createdOrgs.length)];
    const event = await prisma.events.create({ 
      data: {
        ...e,
        organizationID: org.id
      }
    });
    createdEvents.push(event);

    const packageCount = Math.floor(Math.random() * 3) + 1;
    const createdPackages: any[] = [];
    
    const shuffledPkgs = [...packagesData].sort(() => 0.5 - Math.random());
    const selectedPkgs = shuffledPkgs.slice(0, packageCount);

    for (const pkg of selectedPkgs) {
        const createdPkg = await prisma.package.create({
            data: {
                title: pkg.title,
                cost: pkg.cost,
                details: pkg.details,
                eventID: event.id,
            }
        });
        createdPackages.push(createdPkg);
    }

    const partnerCount = Math.floor(Math.random() * 5) + 1;
    const shuffledCorps = [...createdCorps].sort(() => 0.5 - Math.random());
    const selectedCorps = shuffledCorps.slice(0, partnerCount);
    
    const statuses = ['confirmed', 'pending', 'rejected'];

    for (const corp of selectedCorps) {
        await prisma.partners.create({
            data: {
                eventID: event.id,
                corporationID: corp.id,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                packageID: createdPackages[Math.floor(Math.random() * createdPackages.length)].id
            }
        });
    }
  }

  console.log(`Seeding finished successfully.`);
  console.log(`Created ${createdOrgs.length} organizations.`);
  console.log(`Created ${createdCorps.length} corporations.`);
  console.log(`Created ${createdEvents.length} events with packages and partners.`);
}

main().catch((e) => {console.error(e); process.exit(1);}).finally(async () => {await disconnectDB();process.exit(0);});
