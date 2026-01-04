import { useState } from "react";
import Unitsoverview from './subcomp/Unitoverviewcards.jsx'
import Sidebar from './subcomp/sidebar.jsx'
import UserHeader from './subcomp/UserHeader.jsx'

function Unitoverview() {
    const [open, setOpen] = useState(false);
    return(
        <div className={`flex flex-col md:flex-row min-h-screen ${open ? "overflow-hidden md:overflow-auto" : ""}`}>
            <Sidebar  open={open} setOpen={setOpen}/>
            <div className={`flex flex-col flex-1 ${open ? "hidden md:flex" : "flex"}`}>
                <UserHeader />
                <div className="flex-1 p-7">
                    <Unitsoverview />
                </div>
            </div>
        </div>  
    )
}

export default Unitoverview