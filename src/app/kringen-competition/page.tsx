import React from "react";
import Link from "next/link";

const MatchButtons = () => {
    const matches = [
        {
            label: "VTK vs Apolloon",
            href: "/kringen-competition/vtk-apolloon",
            logoLeft: "/kringen/VTK.png",
            logoRight: "/kringen/Apolloon.png",
        },
        {
            label: "LBK vs VRG",
            href: "/kringen-competition/lbk-vrg",
            logoLeft: "/kringen/LBK.png",
            logoRight: "/kringen/VRG.png",
        },
        {
            label: "Industria vs Medica",
            href: "/kringen-competition/industria-medica",
            logoLeft: "/kringen/Industria.png",
            logoRight: "/kringen/Medica.png",
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Wedstrijden</h2>
            <div className="flex flex-col space-y-4">
                {matches.map((match) => (
                    <Link
                        key={match.label}
                        href={match.href}
                        className="flex items-center justify-between bg-blue-100 hover:bg-blue-200 transition-colors rounded-xl p-4 shadow-md"
                    >
                        <img
                            src={match.logoLeft}
                            alt="Logo Left"
                            className="w-16 h-18 object-cover"
                        />
                        <span className="text-xl font-semibold text-center flex-1 ml-3 mr-3">
                          {match.label}
                        </span>
                        <img
                            src={match.logoRight}
                            alt="Logo Right"
                            className="w-16 h-18 object-cover"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MatchButtons;
