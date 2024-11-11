'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// TODO: terms and privacy links

const formSchema = z.object({
  // Step 1: Basic Information
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  businessName: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  country: z.string().min(2, { message: 'Please select a country.' }),

  // Step 2: Loan Purpose
  loanPurpose: z
    .string()
    .min(10, { message: 'Please provide a brief description of the loan purpose.' }),
  loanAmount: z.number().min(1, { message: 'Loan amount must be greater than 0.' }),
  repaymentPeriod: z.string().min(1, { message: 'Please select a repayment period.' }),

  // Step 3: Loan Preferences
  loanTerm: z.string().min(1, { message: 'Please select a loan term.' }),
  interestRate: z.number().min(0, { message: 'Interest rate must be 0 or greater.' }),
  repaymentSchedule: z.string().min(1, { message: 'Please select a repayment schedule.' }),

  // Step 4: Financial Details
  income: z.number().min(0, { message: 'Income must be 0 or greater.' }),
  assets: z.number().min(0, { message: 'Assets must be 0 or greater.' }),
  liabilities: z.number().min(0, { message: 'Liabilities must be 0 or greater.' }),

  // Step 5: Credit and Collateral
  creditScore: z
    .number()
    .min(300)
    .max(850, { message: 'Credit score must be between 300 and 850.' }),
  collateralType: z.string().min(1, { message: 'Please select a collateral type.' }),
  collateralAmount: z.number().min(0, { message: 'Collateral amount must be 0 or greater.' }),

  // Step 6: Blockchain Details
  linkedWallets: z
    .string()
    .array()
    .min(1, { message: 'Please provide at least one linked wallet.' }),

  // Step 7: Supporting Documents
  governmentId: z.instanceof(File).optional(),
  proofOfAddress: z.instanceof(File).optional(),

  // Step 8: User Acknowledgments
  termsAgreement: z
    .boolean()
    .refine(val => val === true, { message: 'You must agree to the terms of service.' }),
  riskAcknowledgment: z
    .boolean()
    .refine(val => val === true, { message: 'You must acknowledge the risks involved.' }),
});

export default function LoanApplicationForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      country: '',
      loanPurpose: '',
      loanAmount: 0,
      repaymentPeriod: '',
      loanTerm: '',
      interestRate: 0,
      repaymentSchedule: '',
      income: 0,
      assets: 0,
      liabilities: 0,
      creditScore: 300,
      collateralType: '',
      collateralAmount: 0,
      linkedWallets: [],
      termsAgreement: false,
      riskAcknowledgment: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here you would typically send the form data to your backend
    alert('Form submitted successfully!');
  }

  const nextStep = () => setStep(step => Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(step => Math.max(step - 1, 1));

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Loan Application</CardTitle>
        <CardDescription>Apply for a loan in our Web3 finance platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div
            className={`'bg-secondary text-secondary-foreground' flex h-8 w-8 items-center justify-center rounded-full`}
            onClick={prevStep}
          >
            <ChevronLeft />
          </div>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                i + 1 <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name (if applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          {/* Add more countries as needed */}
                        </SelectContent>
                      </Select>
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
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe the purpose of the loan"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                  name="repaymentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a repayment period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6months">6 months</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="2years">2 years</SelectItem>
                          <SelectItem value="5years">5 years</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="loanTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a loan term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shortTerm">Short Term</SelectItem>
                          <SelectItem value="mediumTerm">Medium Term</SelectItem>
                          <SelectItem value="longTerm">Long Term</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                  name="repaymentSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Schedule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a repayment schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                  name="assets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Assets (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                  name="liabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Liabilities (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={e => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="300"
                          min="300"
                          max="850"
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
                  name="collateralType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collateral type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="nft">NFTs</SelectItem>
                          <SelectItem value="realEstate">Real Estate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collateralAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={e => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="termsAgreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the terms of service</FormLabel>
                        <FormDescription>
                          You agree to our <Link href="#">Terms of Service</Link> and{' '}
                          <Link href="/privacy">Privacy Policy</Link>.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskAcknowledgment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I acknowledge the risks involved</FormLabel>
                        <FormDescription>
                          You understand and accept the risks associated with decentralized lending.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
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
          <Button onClick={form.handleSubmit(onSubmit)}>Submit Application</Button>
        )}
      </CardFooter>
    </Card>
  );
}
