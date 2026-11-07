
import {
  getHealth,
  getCustomers,
  getPortfolio,
  getWarnings,
} from './api'

async function testBackend() {
  try {
    const [health, customers, portfolio, warnings] =
      await Promise.all([
        getHealth(),
        getCustomers(),
        getPortfolio(),
        getWarnings(),
      ])

    console.log('HEALTH:', health)
    console.log('CUSTOMER COUNT:', customers.total)
    console.log('PORTFOLIO:', portfolio)
    console.log('WARNING COUNT:', warnings.total)

  } catch (error) {
    console.error('BACKEND CONNECTION ERROR:', error.message)
  }
}

testBackend()
