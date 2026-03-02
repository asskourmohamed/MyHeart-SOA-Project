import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patient.service';
import { appointmentService } from '../../services/appointment.service';
import { billingService } from '../../services/billing.service';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalInvoices: number;
  totalRevenue: number;
  upcomingAppointments: any[];
  recentInvoices: any[];
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    upcomingAppointments: [],
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer les données en fonction du rôle
      if (hasRole('admin')) {
        const [patients, appointments, invoices] = await Promise.all([
          patientService.getAllPatients(),
          appointmentService.getAllAppointments(),
          billingService.getAllInvoices()
        ]);

        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
        
        setStats({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          totalInvoices: invoices.length,
          totalRevenue,
          upcomingAppointments: appointments
            .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
            .slice(0, 5),
          recentInvoices: invoices.slice(0, 5)
        });
      } else if (hasRole('patient')) {
        const [appointments, invoices] = await Promise.all([
          appointmentService.getMyAppointments(),
          billingService.getMyInvoices()
        ]);

        setStats({
          totalPatients: 0,
          totalAppointments: appointments.length,
          totalInvoices: invoices.length,
          totalRevenue: 0,
          upcomingAppointments: appointments
            .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
            .slice(0, 5),
          recentInvoices: invoices.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [hasRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                )}
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                  {Math.abs(trend)}% ce mois
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques principales */}
        {hasRole('admin') && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Patients"
                value={stats.totalPatients}
                icon={<PeopleIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.primary.main}
                trend={12}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Rendez-vous"
                value={stats.totalAppointments}
                icon={<CalendarIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.success.main}
                trend={8}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Factures"
                value={stats.totalInvoices}
                icon={<ReceiptIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.warning.main}
                trend={-5}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Revenus"
                value={`${stats.totalRevenue} €`}
                icon={<EuroIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.info.main}
                trend={15}
              />
            </Grid>
          </>
        )}

        {hasRole('patient') && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Mes rendez-vous"
                value={stats.totalAppointments}
                icon={<CalendarIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Mes factures"
                value={stats.totalInvoices}
                icon={<ReceiptIcon sx={{ color: 'white', fontSize: 30 }} />}
                color={theme.palette.warning.main}
              />
            </Grid>
          </>
        )}

        {/* Prochains rendez-vous */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Prochains rendez-vous</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Heure</TableCell>
                    {hasRole('admin') && <TableCell>Patient</TableCell>}
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.upcomingAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                      <TableCell>{apt.startTime}</TableCell>
                      {hasRole('admin') && <TableCell>{apt.patientName}</TableCell>}
                      <TableCell>{apt.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={apt.status}
                          size="small"
                          color={
                            apt.status === 'confirmed' ? 'success' :
                            apt.status === 'scheduled' ? 'warning' :
                            'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Dernières factures */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Dernières factures</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N° Facture</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.invoiceNumber}</TableCell>
                      <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.total} €</TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status}
                          size="small"
                          color={
                            inv.status === 'paid' ? 'success' :
                            inv.status === 'issued' ? 'warning' :
                            inv.status === 'overdue' ? 'error' :
                            'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;