import {cn} from "@/lib/utils";
import { Button } from "./ui/button";

interface IconButtonProps {
    icon: React.ReactElement;
    onClick: () => void;
    className?: string;
}


const IconButton = (props: IconButtonProps) => {

    const {icon, onClick, className} = props;
    return (
        <div>
            <Button onClick={onClick} className={cn("rounded-full flex items-center  bg-white border shadow-md p-2 hover:scale-110 transition", props.className)}>
                {icon}
            </Button>
        </div>
    )
}   


export default IconButton;