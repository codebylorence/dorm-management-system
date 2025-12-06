import { useState } from "react";
import Sidebar from './subcomp/sidebar.jsx'
import UnitProfileCards from './subcomp/UnitProfileCards.jsx'

function UnitProfile() {
    const [open, setOpen] = useState(false);
    return(
        <div className={`flex flex-col md:flex-row min-h-screen ${open ? "overflow-hidden md:overflow-auto" : ""}`}>
            <Sidebar  open={open} setOpen={setOpen}/>
            <div className={`flex flex-col flex-1 p-7 gap-y-3 ${open ? "hidden md:flex" : "flex"}`}>
                <UnitProfileCards/>
            </div>
        </div>
    )
}

export default UnitProfile
