import { useState, useEffect } from "react";
import Iframe from "react-iframe";

const ListItem = ({nft, setActiveNFT, activeNFT, reload}) => { 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
    }, [reload])

    return (
        <div
            className="rounded relative"
            key={nft.externalMetadata.name}
            onClick={() => setActiveNFT(nft)}>
            <div className={"absolute w-36 md:w-44 aspect-square z-10 rounded hover:bg-second " + (loading && "bg-header animate-pulse") + (activeNFT === nft && " !w-40 md:!w-48")}>
                <p className="absolute bottom-0 left-0 px-2 pt-1 font-bold bg-header rounded-bl-sm">{nft.externalMetadata.name.split(" ")[1]}</p>
            </div>
            <Iframe
                className={"w-36 md:w-44 aspect-square rounded " + (loading ? "invisible" : "visible") + (activeNFT === nft && " !w-40 md:!w-48")}
                onLoad={() => setLoading(false)}
                id={nft.externalMetadata.name}
                key={reload} // for reload
                title={nft.externalMetadata.name}
                loading="lazy"
                url={nft.externalMetadata.animation_url}
            />
        </div>
    )
}

export default ListItem;