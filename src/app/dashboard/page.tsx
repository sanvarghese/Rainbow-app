import { Button } from '@mui/material'
import React from 'react'
// import { Button } from '@mui/material'

const page = () => {
    return (
        <div>
            <h2>
                Dashboard
            </h2>
            <button className="btn btn-primary me-3">Bootstrap Button</button>
            <Button variant="contained" color="secondary">
                MUI Button
            </Button>
        </div>
    )
}

export default page