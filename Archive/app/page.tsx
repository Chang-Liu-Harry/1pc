import PlatformLayout from './(platform)/layout';
import DashboardLayout from './(platform)/(dashboard)/layout';
import DashboardPage from './(platform)/(dashboard)/dashboard/page';

export default function Home(props: { searchParams: any }) {
  return (
    <PlatformLayout>
        <DashboardLayout>
            <DashboardPage {...props} />
        </DashboardLayout>
    </PlatformLayout>
  );
}