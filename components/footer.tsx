import Image from "next/image";
import {
  PiFacebookLogoFill,
  PiInstagramLogo,
  PiInstagramLogoFill,
  PiLinkedinLogoFill,
  PiTwitterLogoFill,
  PiYoutubeLogoFill,
} from "react-icons/pi";

const Footer = () => {
  return (
    <div className=" flex lg:items-center pb-10 flex-col px-8 lg:px-0 xl:w-4/4 mx-auto 2xl:w-[55%] ">
      <div className="lg:flex  lg:space-x-32 md:px-0 ">
        <div className="pt-4">
          <span className="mr-2 text-xl font-bold">
            Casper<span className="text-sky-600">ID</span>
          </span>
          <div className="flex  space-x-2">
            <PiInstagramLogoFill className="text-2xl text-gray-500" />
            <PiTwitterLogoFill className="text-2xl text-gray-500" />
            <PiFacebookLogoFill className="text-2xl text-gray-500" />
            <PiYoutubeLogoFill className="text-2xl text-gray-500" />
            <PiLinkedinLogoFill className="text-2xl text-gray-500" />
          </div>
        </div>

        <div className="flex-col space-y-6 ">
          <div className="pt-10 font-medium">PRODUCT</div>
          <div className="font-light space-y-4 text-sm">
            <div>Home</div>
            <div>Jobs</div>
            <div>Verify Identity</div>
          </div>
        </div>

        <div className="flex-col space-y-6 flex ">
          <div className="pt-10 font-medium">USE CASES</div>
          <div className="font-light space-y-4 text-sm">
            <div>User Onboarding & Registration</div>
            <div>KYC / Identity Re-Verification</div>
            <div>Job Applications & Backgrounds</div>
            <div>Payment Method Verification</div>
            <div>Travel (Flight/Hotel) Verification</div>
            <div>Support & Issue Intake</div>
            <div>Enterprise/Team Onboarding</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
