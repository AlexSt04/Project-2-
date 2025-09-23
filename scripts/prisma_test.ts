import prismadb from '../lib/prismadb'

async function main() {
  try {
    const store = await prismadb.store.findFirst()
    console.log('Fetched store:', store)
  } catch (err) {
    console.error('Error querying store:', err)
  } finally {
    await prismadb.$disconnect()
  }
}

main()
