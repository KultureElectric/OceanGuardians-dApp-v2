import { useState, useEffect } from "react";
import Iframe from "react-iframe";

const NFTDisplayStaking = ({nft}) => { 
    const [loading, setLoading] = useState(true);

    return (
        <div className="rounded relative" key={nft.externalMetadata.name}>
            <div className={"absolute w-28 md:w-44 aspect-square z-10 rounded " + (loading && "bg-header animate-pulse")}></div>
            <Iframe
                className={"w-28 md:w-44 aspect-square rounded " + (loading ? "invisible" : "visible")}
                onLoad={() => setLoading(false)}
                id={nft.externalMetadata.name}
                // key={reload} // for reload
                title={nft.externalMetadata.name}
                loading="lazy"
                url={nft.externalMetadata.animation_url}
            />
        </div>
    )
}

export default NFTDisplayStaking;