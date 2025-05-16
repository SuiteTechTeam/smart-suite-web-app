import Link from "next/link";


const dataFooter = [
    {
        id: 1,
        name: "Sobre nosotros",
        link: "#"
    },
    {
        id: 2,
        name: "Productos",
        link: "#"
    },
    {
        id: 3,
        name: "Mi cuenta",
        link: "#"
    },
    {
        id: 4,
        name: "Politica de privacidad",
        link: "#"
    },
]






const Footer = () => {
    return (
        <footer>
            <div className="mt-4 ml-10">
                <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div>
                        <div className="sm:flex sm:items-center sm:justify-between">
                            <p>
                                <span className="font-bold">
                                    A4Books
                                </span>

                            </p>
                            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                                {dataFooter.map((data) => (
                                    <li key={data.id}>
                                        <Link href={data.link} className="mr-4 hover:underline md:mr-6">
                                            {data.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer;
