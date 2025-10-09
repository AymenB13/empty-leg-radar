import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerClose 
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTailOperatorInfo } from "@/hooks/supabase/useTailOperatorInfo";
import { Building2, FileText, Clock, ExternalLink, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface OperatorInfoDrawerProps {
  nNumber: string | null;
  operatorName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OperatorInfoDrawer({ 
  nNumber, 
  operatorName, 
  open, 
  onOpenChange 
}: OperatorInfoDrawerProps) {
  const { data: operatorInfo, isLoading, error } = useTailOperatorInfo(nNumber);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DrawerTitle className="text-2xl">
                Operator Information
              </DrawerTitle>
              <DrawerDescription className="mt-2">
                FAA Part 135 certified operators for tail {nNumber || "N/A"}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
              Error loading operator information: {error.message}
            </div>
          )}

          {/* No Data */}
          {!isLoading && !error && !operatorInfo && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No Part 135 certification data found for this tail number.</p>
              <p className="text-xs mt-2">
                This aircraft may not be registered for charter operations.
              </p>
            </div>
          )}

          {/* Data Display */}
          {operatorInfo && (
            <div className="space-y-6">
              {/* Tail Number Card */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Aircraft Registration
                </div>
                <div className="text-2xl font-bold font-mono">
                  {operatorInfo.n_number || "N/A"}
                </div>
              </div>

              {/* Operators List */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    Certified Operators ({operatorInfo.operator_names?.length || 0})
                  </h3>
                </div>
                
                {operatorInfo.operator_names && operatorInfo.operator_names.length > 0 ? (
                  <div className="space-y-2">
                    {operatorInfo.operator_names.map((name, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{name}</div>
                          {operatorInfo.certificate_designators?.[index] && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Certificate: {operatorInfo.certificate_designators[index]}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Part 135
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No operators listed
                  </p>
                )}
              </div>

              {/* Certificate Designators (if different count) */}
              {operatorInfo.certificate_designators && 
               operatorInfo.certificate_designators.length !== operatorInfo.operator_names?.length && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      Certificate Designators
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {operatorInfo.certificate_designators.map((cert, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">Certification Notice</p>
                    <p>
                      Source: FAA Part 135 registry. The displayed operator name may differ 
                      from the FAA registered owner. This data confirms charter eligibility 
                      under US regulations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Updated At */}
              {operatorInfo.updated_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last updated: {format(new Date(operatorInfo.updated_at), "PPP")}
                  </span>
                </div>
              )}

              {/* Link to FAA source */}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <a 
                    href={`https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${nNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on FAA Registry
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
