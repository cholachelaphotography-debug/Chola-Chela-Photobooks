import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import OrderForm from "./OrderForm";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { order: true },
  });

  if (!project) notFound();

  const template = getTemplate(project.templateId);

  return (
    <OrderForm
      project={{
        id: project.id,
        title: project.title,
        pageCount: project.pageCount,
        templateName: template?.name || project.templateId,
        hasOrder: !!project.order,
        existingOrder: project.order
          ? {
              id: project.order.id,
              amount: project.order.amount,
              status: project.order.status,
              paymentStatus: project.order.paymentStatus,
              bookSize: project.order.bookSize,
              coverType: project.order.coverType,
              materialName: project.order.materialName,
              receiptNumber: project.order.receiptNumber,
              paymentMethod: project.order.paymentMethod,
            }
          : null,
      }}
      userName={session.user.name || "User"}
    />
  );
}
