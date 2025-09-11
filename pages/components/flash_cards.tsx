import { ReactNode, FC, useState } from "react";

export interface FlashCard {
    front: String,
    back: String
}
export type FlashCardSet = FlashCard[];

// components/FlashcardFront.js
export const FlashCards: FC<{ cards: FlashCardSet }> = ({ cards }) => {
    const [idx, setIdx] = useState(0);
    const [card, setCard] = useState(cards[0])
    const [toggleFlip, setToggleFlip] = useState(false);
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="perspective w-80 h-48 cursor-pointer" onClick={() => {
                if (toggleFlip) {
                    setToggleFlip(false)
                    setIdx(idx + 1)
                } else {
                    setToggleFlip(true)
                }
            }}>
                <div className={`relative w-full h-full duration-500 transform-style preserve-3d ${toggleFlip ? "flipped" : ""}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full bg-white rounded-xl shadow-xl flex items-center justify-center p-4 backface-hidden">
                        <p className="text-xl font-semibold text-gray-800">What is the capital of France?</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full bg-blue-500 text-white rounded-xl shadow-xl flex items-center justify-center p-4 backface-hidden rotate-y-180">
                        <p className="text-xl font-semibold">Paris</p>
                    </div>
                </div>
            </div>
        </div>

    )
};


