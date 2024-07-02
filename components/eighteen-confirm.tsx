import { Button } from "@/components/ui/button";

interface EighteenConfirmProps {
  onConfirm: () => void;
}

export const EighteenConfirm: React.FC<EighteenConfirmProps> = ({onConfirm}) => {

  return (
    <div className="bg-black text-white h-screen flex justify-center items-start p-2">
      <div className="w-full max-w-screen-md flex flex-col mt-28 py-16 px-8 border border-slate-800 shadow-[0_0_40px_5px_rgba(255,255,255,.15)]">
        <h1 className="text-center text-4xl">Onepiece AI</h1>
        <p className="text-center text-5xl mt-6 mb-4">This is an adult website</p>
        <p className="text-center text-xl text-[#ccc]">
          This website contains age limited content, including nude and explicit
          pornographic materials. By logging in, you confirm that you are over
          18 years old or that you are an adult in the jurisdiction where you
          visited this website.
        </p>
        <div className="flex justify-around space-x-4 mt-12">
          <Button
            type="button"
            size="lg"
            className="bg-secondary text-primary hover:bg-secondary-dark w-1/2 text-black bg-[#f90]"
            onClick={onConfirm}
          >
            Over 18 years old - Enter
          </Button>
          <Button
            type="button"
            size="lg"
            className="bg-secondary text-primary hover:bg-secondary-dark w-1/2 text-white bg-[#1f1f1f]"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Under 18 years old - Exit
          </Button>
        </div>
      </div>
    </div>
  );
};
