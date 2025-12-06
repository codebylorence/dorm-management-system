import { useState } from "react";
import Sidebar from './subcomp/sidebar.jsx'
import Tenantoverviewcards from './subcomp/tenantoverviewcards.jsx'

function tenantoverview() {
    const [open, setOpen] = useState(false);
    return(
        <div className={`flex flex-col md:flex-row min-h-screen ${open ? "overflow-hidden md:overflow-auto" : ""}`}>
            <Sidebar  open={open} setOpen={setOpen}/>
            <div className={`flex flex-col flex-1 p-7 gap-y-3 ${open ? "hidden md:flex" : "flex"}`}>
                <Tenantoverviewcards/>
            </div>
        </div>
    )
}

export default tenantoverview