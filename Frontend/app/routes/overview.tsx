// import PrimaryPageHeader from "~/blocks/PrimaryPageHeader";
import { Button } from "~/components/button/Button";
import { ArrowSquareUpRight } from "@phosphor-icons/react";

export default function Overview() {
    return (
        <div className="p-8 px-12">
            {/* Header section */}
            {/* <PrimaryPageHeader title="Overview" subtitle="Manage your SQLite databases and external connections">
                <Button
                    title={'Documentation'}
                    variant="secondary"
                ></Button>
                <Button
                    title={'Limits & Pricing'}
                    variant="ghost"
                    displayContent="items-first"
                >
                    <ArrowSquareUpRight size={16} />
                </Button>
            </PrimaryPageHeader> */}

            {/* Main contents */}
            <div className="w-full flex gap-10">
                <div className="w-2/3">
                    Left
                </div>

                <div className="w-1/3">
                    Right
                </div>
            </div>
        </div>
    );
  } 