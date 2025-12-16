use getrandom::{register_custom_getrandom, Error};

// This function is the custom implementation for the getrandom crate
// required when targeting wasm32-unknown-unknown without JS support.
fn casper_getrandom(dest: &mut [u8]) -> Result<(), Error> {
    // For a deterministic smart contract, we don't have a source of randomness
    // accessible via standard OS calls. If randomness is needed, it should be
    // passed in via arguments or derived from block time/seed (though insecure).
    // For compilation purposes, we fill with zeros or do nothing.
    for byte in dest.iter_mut() {
        *byte = 0;
    }
    Ok(())
}

register_custom_getrandom!(casper_getrandom);
