import { useState } from "react";
import Sidebar from './subcomp/sidebar.jsx';
import SettingsContent from './subcomp/SettingsContent.jsx';
import UserHeader from './subcomp/UserHeader.jsx';

function Settings() {
    const [open, setOpen] = useState(false);
    return(
        <div className={`flex flex-col md:flex-row min-h-screen ${open ? "overflow-hidden md:overflow-auto" : ""}`}>
            <Sidebar open={open} setOpen={setOpen}/>
            <div className={`flex flex-col flex-1 ${open ? "hidden md:flex" : "flex"}`}>
                <UserHeader />
                <div className="flex-1 p-7">
                    <SettingsContent/>
                </div>
            </div>
        </div>
    )
}

export default Settings;

