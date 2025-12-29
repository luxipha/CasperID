"use client";

import React, { useState, useEffect } from "react";
import { useCasper } from "@/lib/casper-context";

import { Button } from "@/components/ui/button";

import { X, AlignJustify } from "lucide-react";
import Link from "next/link";
import DropdownMenu from "./drop-down-menu";
import { getUserByAddress } from "@/utils/queries";

const ActionButtons = () => {
  const { isConnected, connect, disconnect, publicKey } = useCasper();

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [UserInfo, setUserInfo] = useState("");

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (isConnected && publicKey) {
        console.log("Fetching user info for:", publicKey);
        // Use the new API instead of blockchain queries to avoid infinite loops
        try {
          const response = await fetch(`http://localhost:3001/api/identity-status?wallet=${publicKey}`);
          if (response.ok) {
            const userInfo = await response.json();
            setUserInfo(userInfo);
          } else {
            setUserInfo("");
          }
        } catch (e) {
          console.error("Error fetching user info", e);
          setUserInfo("");
        }
      } else {
        setUserInfo("");
      }
    };

    // Add a small delay to prevent rapid consecutive calls
    const timeoutId = setTimeout(getUserInfo, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isConnected, publicKey]);

  const authenticated = isConnected;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null instead of placeholder to avoid hydration mismatch
  }

  return (
    <div className="pr-2">
      <div className=" items-center justify-center flex ">
        <div className="flex xl:space-x-4">
          {authenticated && UserInfo !== "User does not exist." ? (
            <>
              <Link
                href={"/me/analytics"}
                className="
            lg:flex
            items-center
            hidden
            
            "
              >
                <div className="">Analytics</div>
              </Link>
              <div
                className="font-thin     
        lg:flex
        ml-4 mr-0
            items-center
            hidden"
              >
                |
              </div>
            </>
          ) : authenticated && UserInfo == "User does not exist." ? (
            <>
              <Link
                href={"/onboard"}
                className="
          lg:flex
          items-center
          hidden
          
          "
              >
                <div className="">Get DID</div>
              </Link>
              <div
                className="font-thin     
      lg:flex
          items-center
          ml-4 mr-0
          hidden"
              >
                |
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        <div className="flex lg:space-x-2 items-center pr-4">
          <Link href={"/free"} className="hidden lg:flex items-center text-md">
            {/* Removed nested Button, replaced with direct content if needed or just empty Link */}
          </Link>
          {authenticated ? (
            <Button
              className="hidden lg:block bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              className="hidden lg:block bg-blue-600 hover:bg-blue-700 text-white border-0 font-semibold shadow-md transition-all hover:-translate-y-0.5"
              onClick={connect}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      {isDropdownVisible && (
        <div
          onClick={toggleDropdown}
          className="
             rounded-full
             xl:hidden"
        >
          <X className="h-5 w-5  items-center justify-center rounded-full" />
        </div>
      )}
      {!isDropdownVisible && (
        <div onClick={toggleDropdown} className="flex lg:hidden">
          <AlignJustify className="h-6 w-6 items-center justify-center mr-2" />
        </div>
      )}

      {isDropdownVisible && <DropdownMenu onClose={closeDropdown} />}
    </div>
  );
};

export default ActionButtons;
