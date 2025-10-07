import React from 'react'
import CreateCompanyForm from '../components/BecomeSeller/CreateCompanyForm'
import MerchantRegisterForm from '../components/BecomeSeller/MerchantRegisterForm'
import CreateProduct from '../components/BecomeSeller/CreateProduct'
import Footer from '../components/Footer/Footer'
import Header from '../components/Header/Header'

const page = () => {
  return (
    <>
      <Header />

      <MerchantRegisterForm />
      {/* <CreateCompanyForm /> */}
      {/* <CreateProduct /> */}

      <Footer />
    </>

  )
}

export default page
