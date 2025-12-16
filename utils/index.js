import { ethers } from "ethers";
import identiFi from "./identiFi.json";

export const contract = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractReader = new ethers.Contract(
      "0x041b5F12624D072A599F928e6143579D5B70Bd49",
      identiFi.abi,
      signer
    );

    return contractReader;
  }
  return null;
};
