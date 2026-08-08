import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-secondary to-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="relative flex flex-col items-center z-10">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${step < currentStep 
                  ? 'bg-gradient-to-br from-secondary to-primary shadow-lg' 
                  : step === currentStep
                  ? 'bg-gradient-to-br from-secondary to-primary shadow-[0_0_20px_rgba(233,196,106,0.5)] scale-110'
                  : 'bg-muted border-2 border-border'
                }
              `}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <span className={`text-sm font-bold ${step === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step}
                </span>
              )}
            </div>
            <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
              Étape {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
