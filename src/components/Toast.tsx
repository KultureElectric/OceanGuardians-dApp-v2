const Toast = (msg: string, txid: string) => {
    return (
        <div className="flex justify-between items-center">
            <p>{msg}</p>
            <a
                href={'https://solana.fm/tx/' + txid}
                target="_blank"
                rel="noreferrer"
                className="flex flex-row link text-blue"
            >
                <svg className="flex-shrink-0 h-5 text-primary-light w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                <div className="flex mx-2 text-sm">{txid.slice(0, 4)}...
                {txid.slice(txid.length - 4)}
                </div>
            </a>
        </div>
    )
}

export default Toast