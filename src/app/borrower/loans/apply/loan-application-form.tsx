'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  StateMajorCities,
  USState,
  BusinessLegalStructure,
  BusinessIndustry,
} from '@/types/business';
import QRCode from 'react-qr-code';
import { CreditScore } from '@prisma/client';
import {
  getCreditScoreOfLoanApplication,
  submitLoanApplication,
} from './actions/loan-application-actions';
import {
  loanApplicationFormSchema,
  BUSINESS_DESCRIPTION_MAX_LENGTH,
  BUSINESS_DESCRIPTION_MIN_LENGTH,
  BUSINESS_FOUNDED_YEAR_MAX,
  BUSINESS_FOUNDED_YEAR_MIN,
} from './form-schema';

interface LoanApplicationFormProps {
  loanApplicationId: string;
  accountAddress: string;
  reclaimRequestUrl: string;
  reclaimStatusUrl: string;
}
export default function LoanApplicationForm({
  loanApplicationId,
  accountAddress,
  reclaimRequestUrl,
  reclaimStatusUrl,
}: LoanApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [creditScore, setCreditScore] = useState<Partial<CreditScore> | null>(null);
  const reclaimProofIntervalIdRef = useRef<NodeJS.Timer | null>(null);
  const creditScoreIntervalIdRef = useRef<NodeJS.Timer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { toast } = useToast();

  const totalSteps = 3;

  const form = useForm<z.infer<typeof loanApplicationFormSchema>>({
    resolver: zodResolver(loanApplicationFormSchema),
    defaultValues: {
      applicationId: loanApplicationId,
      accountAddress,
      hasOutstandingLoans: false,
      outstandingLoans: [],
      hasReclaimProof: false,
      creditScoreId: undefined,
    },
  });

  const businessState = useWatch({
    control: form.control,
    name: 'businessState',
  });

  const hasOutstandingLoans = useWatch({
    control: form.control,
    name: 'hasOutstandingLoans',
  });

  const outstandingLoans = useWatch({
    control: form.control,
    name: 'outstandingLoans',
  });

  const hasReclaimProof = useWatch({
    control: form.control,
    name: 'hasReclaimProof',
  });

  const creditScoreId = useWatch({
    control: form.control,
    name: 'creditScoreId',
  });

  async function onSubmit(values: z.infer<typeof loanApplicationFormSchema>) {
    // if (!values.hasReclaimProof) {
    //   form.setError('hasReclaimProof', {
    //     type: 'manual',
    //     message: 'Please complete bank account verification before submitting',
    //   });
    //   return;
    // }

    // if (!values.creditScoreId) {
    //   form.setError('creditScoreId', {
    //     type: 'manual',
    //     message: 'Please wait for credit score to be calculated',
    //   });
    //   return;
    // }

    try {
      setIsSubmitting(true);

      await submitLoanApplication({
        formData: values,
        accountAddress,
      });

      toast({
        title: 'Loan application submitted',
        variant: 'success',
      });

      router.replace('/borrower/loans');
    } catch (error) {
      toast({
        title: 'Error submitting loan application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function cardTitleForStep(step: number): string {
    switch (step) {
      case 1:
        return 'Business information';
      case 2:
        return 'Cash flow verification';
      case 3:
        return 'Current loans';
      default:
        return 'Loan Application';
    }
  }

  const nextStep = () => setStep(step => Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(step => Math.max(step - 1, 1));
  const clickStep = (step: number) => setStep(step);

  const startReclaimProofPolling = useCallback(async () => {
    const pollStatus = async () => {
      try {
        const response = await fetch(reclaimStatusUrl);
        const jsonResponse = await response.json();
        if (jsonResponse?.session?.statusV2 === 'PROOF_SUBMITTED') {
          form.setValue('hasReclaimProof', true);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    const newIntervalId = setInterval(pollStatus, 3000);
    reclaimProofIntervalIdRef.current = newIntervalId;
  }, [reclaimStatusUrl, form]);

  const stopReclaimProofPolling = (intervalId: NodeJS.Timer | null) => {
    clearInterval(intervalId as NodeJS.Timeout);
    reclaimProofIntervalIdRef.current = null;
  };

  const startCreditScorePolling = useCallback(async () => {
    const pollStatus = async () => {
      try {
        const response = await getCreditScoreOfLoanApplication(loanApplicationId);

        if (response.creditScore) {
          const { creditScore } = response;
          form.setValue('creditScoreId', creditScore.id);
          setCreditScore(creditScore);
        }
      } catch (error) {
        console.error('Error polling credit score:', error);
      }
    };

    const newIntervalId = setInterval(pollStatus, 3000);
    creditScoreIntervalIdRef.current = newIntervalId;
  }, [loanApplicationId, form]);

  const stopCreditScorePolling = (intervalId: NodeJS.Timer | null) => {
    clearInterval(intervalId as NodeJS.Timeout);
    creditScoreIntervalIdRef.current = null;
  };

  useEffect(() => {
    if (step === 2 && !hasReclaimProof) {
      startReclaimProofPolling();
    }
  }, [hasReclaimProof, step, startReclaimProofPolling]);

  useEffect(() => {
    if (hasReclaimProof) {
      stopReclaimProofPolling(reclaimProofIntervalIdRef.current);
    }
  }, [hasReclaimProof]);

  useEffect(() => {
    if (hasReclaimProof) {
      startCreditScorePolling();
    }

    return () => {
      stopCreditScorePolling(creditScoreIntervalIdRef.current);
    };
  }, [hasReclaimProof, startCreditScorePolling]);

  useEffect(() => {
    if (creditScoreId) {
      stopCreditScorePolling(creditScoreIntervalIdRef.current);
    }

    return () => {
      stopCreditScorePolling(creditScoreIntervalIdRef.current);
    };
  }, [creditScoreId]);

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{cardTitleForStep(step)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-10 flex justify-between">
          <div
            className={`'bg-secondary text-secondary-foreground' flex h-8 w-8 items-center justify-center rounded-full`}
            onClick={prevStep}
          >
            <ChevronLeft />
          </div>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80 ${
                i + 1 <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              onClick={() => clickStep(i + 1)}
            >
              {i + 1}
            </div>
          ))}

          <div
            className={`'bg-secondary text-secondary-foreground' flex h-8 w-8 items-center justify-center rounded-full`}
            onClick={nextStep}
          >
            <ChevronRight />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessLegalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="businessState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(USState).map(state => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessState &&
                              StateMajorCities[businessState as USState].map(city => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the state first, then select the city.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EIN</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessFoundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={BUSINESS_FOUNDED_YEAR_MIN}
                            max={BUSINESS_FOUNDED_YEAR_MAX}
                            {...field}
                            onChange={e => {
                              const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                              field.onChange(value ? +value : '');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessLegalStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal structure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(BusinessLegalStructure).map(structure => (
                              <SelectItem key={structure} value={structure}>
                                {structure}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="businessWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessPrimaryIndustry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(BusinessIndustry).map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of your business</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            className="resize-none"
                            maxLength={BUSINESS_DESCRIPTION_MAX_LENGTH}
                            {...field}
                          />
                          <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                            {field.value?.length || 0}/{BUSINESS_DESCRIPTION_MAX_LENGTH}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Minimum {BUSINESS_DESCRIPTION_MIN_LENGTH} characters, maximum{' '}
                        {BUSINESS_DESCRIPTION_MAX_LENGTH} characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasReclaimProof"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col items-center space-y-4">
                          <p className="text-center">Scan the QR code to link your bank account</p>
                          <QRCode value={reclaimRequestUrl} size={256} />
                          {hasReclaimProof ? (
                            <div className="flex items-center space-x-2 rounded-lg bg-green-100 p-3 text-green-700">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <p className="font-medium">Bank account linked successfully</p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <p className="animate-pulse">Waiting for completion...</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditScoreId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <>
                          <p className="text-center">Your credit score</p>
                          <div className="grid grid-cols-4 gap-4 text-center text-sm">
                            {/* Headers */}
                            <div className="font-medium text-muted-foreground">Score</div>
                            <div className="font-medium text-muted-foreground">Range</div>
                            <div className="font-medium text-muted-foreground">Type</div>
                            <div className="font-medium text-muted-foreground">Bureau</div>

                            {/* Values */}
                            <div className="font-semibold">
                              {creditScore?.score ?? <LoadingSpinner />}
                            </div>
                            <div className="font-semibold">
                              {creditScore?.scoreRangeMin && creditScore?.scoreRangeMax ? (
                                `${creditScore.scoreRangeMin}-${creditScore.scoreRangeMax}`
                              ) : (
                                <LoadingSpinner />
                              )}
                            </div>
                            <div className="font-semibold">
                              {creditScore?.scoreType ?? <LoadingSpinner />}
                            </div>
                            <div className="font-semibold">
                              {creditScore?.creditBureau ?? <LoadingSpinner />}
                            </div>
                          </div>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasOutstandingLoans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Does your business currently have outstanding loans?</FormLabel>
                      <FormDescription>
                        (ex: term loans, revolving credit, equipment financing, etc.)
                      </FormDescription>
                      <Select
                        onValueChange={value => {
                          field.onChange(value === 'yes');
                          // Add this block to handle automatic loan item creation
                          if (value === 'yes' && form.getValues('outstandingLoans').length === 0) {
                            form.setValue('outstandingLoans', [
                              {
                                lenderName: '',
                                loanType: '',
                                outstandingBalance: 0,
                                monthlyPayment: 0,
                                remainingMonths: 0,
                                annualInterestRate: 0,
                              },
                            ]);
                          }
                        }}
                        value={field.value ? 'yes' : 'no'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasOutstandingLoans && (
                  <FormField
                    control={form.control}
                    name="outstandingLoans"
                    render={({ field }) => (
                      <div className="space-y-4">
                        {field.value.map((loan, index) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.lenderName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lender name</FormLabel>
                                    <FormDescription>
                                      The financial institution that providing the loan.
                                    </FormDescription>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.loanType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Loan type</FormLabel>
                                    <FormDescription>
                                      i.e. a term loan, revolving credit, equipment financing, etc.
                                    </FormDescription>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.outstandingBalance`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Outstanding balance ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(+e.target.value)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.monthlyPayment`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Monthly payment ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(+e.target.value)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.remainingMonths`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Loan term remaining (months)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(+e.target.value)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`outstandingLoans.${index}.annualInterestRate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Annual interest rate (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(+e.target.value)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button
                              variant="destructive"
                              className="mt-4"
                              onClick={() => {
                                const updatedLoans = outstandingLoans.filter((_, i) => i !== index);
                                form.setValue('outstandingLoans', updatedLoans);

                                // If there are no more loans, set hasOutstandingLoans to false
                                if (updatedLoans.length === 0) {
                                  form.setValue('hasOutstandingLoans', false);
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const currentLoans = form.getValues('outstandingLoans');
                            form.setValue('outstandingLoans', [
                              ...currentLoans,
                              {
                                lenderName: '',
                                loanType: '',
                                outstandingBalance: 0,
                                monthlyPayment: 0,
                                remainingMonths: 0,
                                annualInterestRate: 0,
                              },
                            ]);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Loan
                        </Button>
                      </div>
                    )}
                  />
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button onClick={prevStep} variant="outline">
            Previous
          </Button>
        )}
        {step < totalSteps && <Button onClick={nextStep}>Next</Button>}
        {step === totalSteps && (
          <Button disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);
