import { SVGAttributes } from "react";

export default function ApplicationLogo(
    props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            {...props}
            src="/images/MunicipalityLogo.png"
            alt="Official Seal"
        />
    );
}
