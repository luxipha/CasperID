import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface TourProps {
    run: boolean;
    onFinish: () => void;
}

export const Tour: React.FC<TourProps> = ({ run, onFinish }) => {
    const [steps] = useState<Step[]>([
        {
            target: 'body',
            content: (
                <div className="text-left p-2">
                    <h3 className="text-xl font-black mb-2 text-[#8652E2]">Welcome to CasperID!</h3>
                    <p className="text-sm text-gray-600 font-medium">
                        Your portable, consent-based identity layer. Let's show you how to manage your digital presence.
                    </p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#tour-identity-card',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-1">Your Identity Badge</h4>
                    <p className="text-sm text-gray-600">
                        This shows your current verification tier. Complete more checks to unlock full features.
                    </p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '#tour-kyc-card',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-1">Reusable KYC</h4>
                    <p className="text-sm text-gray-600">
                        Verify your identity once and reuse it across any platform that supports CasperID.
                    </p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '#tour-trust-card',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-1">Trust Score</h4>
                    <p className="text-sm text-gray-600">
                        Your reputation in the ecosystem. Higher scores increase your credibility with dApps.
                    </p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '#tour-quick-actions',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-1">Quick Actions</h4>
                    <p className="text-sm text-gray-600">
                        Create "Personas" for different contexts, register your .cid name, or import existing DIDs.
                    </p>
                </div>
            ),
            placement: 'left',
        },
        {
            target: '#tour-sidebar',
            content: (
                <div className="text-left">
                    <h4 className="font-bold text-lg mb-1">Navigation</h4>
                    <p className="text-sm text-gray-600">
                        Access your Credential Vault, manage your names, and control who has access to your data.
                    </p>
                </div>
            ),
            placement: 'right',
        }
    ]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            onFinish();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: '#fff',
                    backgroundColor: '#fff',
                    overlayColor: 'rgba(0, 0, 0, 0.4)',
                    primaryColor: '#8652E2',
                    textColor: '#1A1A1A',
                    zIndex: 1000,
                },
                tooltipContainer: {
                    textAlign: 'left',
                    borderRadius: '24px',
                },
                buttonNext: {
                    backgroundColor: '#8652E2',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                },
                buttonBack: {
                    color: '#666',
                    fontWeight: 'bold',
                },
                buttonSkip: {
                    color: '#999',
                    fontSize: '12px',
                }
            }}
        />
    );
};
