const { PrismaClient } = require('../node_modules/.prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const store = await prisma.store.findFirst()
    console.log('Fetched store:', store)
  } catch (err) {
    console.error('Error querying store:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
