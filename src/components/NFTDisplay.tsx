import Image from "next/image";
import _ from "lodash"

import config from "../../public/traits/config.json"

const NFTDisplay = ({activeNFT, traitReference, previewTrait}: any) => {

    const imageId = Number(activeNFT.externalMetadata?.name.split('#')[1]) - 1; 

    return (
        <div className="relative w-full aspect-square border-8 border-second rounded-t lg:rounded-none lg:!rounded-l">
            {
            _.map(Object.keys(config), key => {
                if (key === traitReference && previewTrait != "") {
                    return (
                    <Image key={key} className={config[key].order + " rounded"} src={`/traits/${key}/${previewTrait}.png`} layout="fill" />
                )
                    
                }
                return (
                    <Image key={key} className={config[key].order + " rounded"} src={`/traits/${key}/${activeNFT.dynamicLayers[key].replace('iT', 'i-T')}.png`} layout="fill" />
                )
            })
            }
            <Image className="z-50 rounded" src={`/traits/imagesOnly/${imageId}.png`} layout="fill" />
        </div>
    )
}

export default NFTDisplay;