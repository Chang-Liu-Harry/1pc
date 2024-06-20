const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function main() {
  try {
    await db.category.createMany({
      data: [
        { name: 'Anime' },
        { name: 'Asian' },
        { name: 'Blonde' },
        { name: 'Latino' },
        { name: 'Japanese' },
      ]
    })

  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}

main()