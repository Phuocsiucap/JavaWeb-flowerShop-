package com.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;

public class DatabaseConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/flower_shop";
    private static final String USER = "root";
    private static final String PASSWORD = "abc123";
    
    // IMPROVED connection pool settings
    private static final int INITIAL_POOL_SIZE = 10;        // Increased from 8
    private static final int MAX_POOL_SIZE = 25;            // Increased from 15
    private static final int CONNECTION_TIMEOUT_SECONDS = 10; // Increased from 5
    private static final int MAX_IDLE_TIME_MINUTES = 30;    // Close idle connections after 30 min
    
    // Connection pool with proper tracking
    private static BlockingQueue<PooledConnection> connectionPool = new LinkedBlockingQueue<>();
    private static AtomicInteger totalConnectionsCreated = new AtomicInteger(0);
    private static AtomicInteger connectionsInUse = new AtomicInteger(0);
    private static volatile boolean isInitialized = false;
    private static ScheduledExecutorService cleanupExecutor;

    // Wrapper class to track connection usage
    private static class PooledConnection {
        private final Connection connection;
        private volatile long lastUsed;
        private volatile boolean inUse;
        
        public PooledConnection(Connection connection) {
            this.connection = connection;
            this.lastUsed = System.currentTimeMillis();
            this.inUse = false;
        }
        
        public Connection getConnection() { return connection; }
        public long getLastUsed() { return lastUsed; }
        public boolean isInUse() { return inUse; }
        public void setInUse(boolean inUse) { 
            this.inUse = inUse; 
            this.lastUsed = System.currentTimeMillis();
        }
    }

    static {
        try {
            // Load JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            initializePool();
            startCleanupTask();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("JDBC Driver not found!", e);
        }
    }

    private DatabaseConnection() {
        // Private constructor to prevent instantiation
    }

    /**
     * Initialize the connection pool with improved settings
     */
    private static synchronized void initializePool() {
        if (isInitialized) {
            return;
        }
        
        try {
            System.out.println("Initializing improved database connection pool...");
            // Create initial connections
            for (int i = 0; i < INITIAL_POOL_SIZE; i++) {
                Connection conn = createNewConnection();
                if (conn != null) {
                    connectionPool.offer(new PooledConnection(conn));
                    totalConnectionsCreated.incrementAndGet();
                }
            }
            isInitialized = true;
            System.out.println("Database connection pool initialized with " + connectionPool.size() + " connections");
            logPoolStatus();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize connection pool", e);
        }
    }

    /**
     * Start cleanup task to remove stale connections
     */
    private static void startCleanupTask() {
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor();
        cleanupExecutor.scheduleAtFixedRate(() -> {
            try {
                cleanupStaleConnections();
                logPoolStatus();
            } catch (Exception e) {
                System.err.println("Error during connection cleanup: " + e.getMessage());
            }
        }, 5, 5, TimeUnit.MINUTES); // Run every 5 minutes
    }

    /**
     * Remove stale connections from the pool
     */
    private static void cleanupStaleConnections() {
        long currentTime = System.currentTimeMillis();
        long maxIdleTime = MAX_IDLE_TIME_MINUTES * 60 * 1000;
        
        connectionPool.removeIf(pooledConn -> {
            if (!pooledConn.isInUse() && (currentTime - pooledConn.getLastUsed()) > maxIdleTime) {
                try {
                    pooledConn.getConnection().close();
                    totalConnectionsCreated.decrementAndGet();
                    System.out.println("Closed stale connection. Pool size: " + connectionPool.size());
                    return true;
                } catch (SQLException e) {
                    System.err.println("Error closing stale connection: " + e.getMessage());
                }
            }
            return false;
        });
    }

    /**
     * Create a new database connection with optimized settings
     */
    private static Connection createNewConnection() throws SQLException {
        // Optimized connection URL for better performance and stability
        String connectionUrl = URL + 
            "?useSSL=false" +
            "&allowPublicKeyRetrieval=true" +
            "&serverTimezone=UTC" +
            "&autoReconnect=true" +
            "&failOverReadOnly=false" +
            "&maxReconnects=3" +
            "&initialTimeout=2" +
            "&connectTimeout=8000" +         // 8 seconds
            "&socketTimeout=15000" +         // 15 seconds  
            "&tcpKeepAlive=true" +
            "&useLocalSessionState=true" +
            "&useLocalTransactionState=true" +
            "&rewriteBatchedStatements=true" +
            "&cachePrepStmts=true" +
            "&prepStmtCacheSize=250" +
            "&prepStmtCacheSqlLimit=2048" +
            "&useServerPrepStmts=true" +
            "&maintainTimeStats=false";     // Reduce overhead
            
        Connection conn = DriverManager.getConnection(connectionUrl, USER, PASSWORD);
        
        // Set optimized connection properties
        conn.setAutoCommit(true);
        
        return conn;
    }

    /**
     * Get a connection from the pool with improved error handling
     */
    public static Connection getConnection() throws SQLException {
        try {
            // First try to get an existing connection
            PooledConnection pooledConn = connectionPool.poll(CONNECTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            if (pooledConn == null) {
                // Pool is empty, create new connection if under max limit
                if (totalConnectionsCreated.get() < MAX_POOL_SIZE) {
                    Connection newConn = createNewConnection();
                    totalConnectionsCreated.incrementAndGet();
                    connectionsInUse.incrementAndGet();
                    System.out.println("Created new connection. Total: " + totalConnectionsCreated.get() + 
                                     ", In use: " + connectionsInUse.get());
                    return newConn;
                } else {
                    // Log detailed pool status for debugging
                    logDetailedPoolStatus();
                    throw new SQLException("Connection pool exhausted. Unable to get connection within " + 
                                         CONNECTION_TIMEOUT_SECONDS + " seconds. Total connections: " + 
                                         totalConnectionsCreated.get() + ", In use: " + connectionsInUse.get());
                }
            }
            
            Connection conn = pooledConn.getConnection();
            
            // Validate connection with longer timeout
            if (conn.isClosed() || !conn.isValid(3)) {
                // Connection is invalid, create a new one
                try { conn.close(); } catch (SQLException ignore) {}
                totalConnectionsCreated.decrementAndGet();
                
                if (totalConnectionsCreated.get() < MAX_POOL_SIZE) {
                    conn = createNewConnection();
                    totalConnectionsCreated.incrementAndGet();
                } else {
                    throw new SQLException("Cannot create new connection - pool limit reached");
                }
            }
            
            pooledConn.setInUse(true);
            connectionsInUse.incrementAndGet();
            return conn;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SQLException("Interrupted while waiting for connection", e);
        }
    }

    /**
     * Return a connection to the pool with improved validation
     */
    public static void returnConnection(Connection conn) {
        if (conn != null) {
            try {
                connectionsInUse.decrementAndGet();
                
                // Enhanced validation with longer timeout
                if (!conn.isClosed() && conn.isValid(3)) {
                    // Reset connection state to ensure it's clean
                    if (!conn.getAutoCommit()) {
                        conn.rollback(); // Rollback any uncommitted transactions
                        conn.setAutoCommit(true);
                    }
                    
                    // Return to pool if there's space
                    if (connectionPool.size() < INITIAL_POOL_SIZE) {
                        PooledConnection pooledConn = new PooledConnection(conn);
                        pooledConn.setInUse(false);
                        connectionPool.offer(pooledConn);
                    } else {
                        // Pool is full, close the connection
                        conn.close();
                        totalConnectionsCreated.decrementAndGet();
                    }
                } else {
                    // Connection is invalid, close it
                    try { 
                        conn.close(); 
                        totalConnectionsCreated.decrementAndGet();
                    } catch (SQLException ignore) {}
                }
            } catch (SQLException e) {
                System.err.println("Error returning connection to pool: " + e.getMessage());
                try { 
                    conn.close(); 
                    totalConnectionsCreated.decrementAndGet();
                } catch (SQLException ignore) {}
            }
        }
    }

    /**
     * Close all connections in the pool (for shutdown)
     */
    public static synchronized void closeAllConnections() {
        System.out.println("Closing all database connections...");
        
        // Stop cleanup task
        if (cleanupExecutor != null) {
            cleanupExecutor.shutdown();
        }
        
        PooledConnection pooledConn;
        while ((pooledConn = connectionPool.poll()) != null) {
            try {
                pooledConn.getConnection().close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        
        totalConnectionsCreated.set(0);
        connectionsInUse.set(0);
        isInitialized = false;
        System.out.println("All database connections closed");
    }

    /**
     * Get basic pool status information
     */
    public static String getPoolStatus() {
        return String.format("Connection Pool Status - Available: %d, Total Created: %d, In Use: %d, Max: %d", 
                           connectionPool.size(), totalConnectionsCreated.get(), 
                           connectionsInUse.get(), MAX_POOL_SIZE);
    }
    
    /**
     * Log detailed pool status for debugging
     */
    public static void logDetailedPoolStatus() {
        System.out.println("=== DETAILED CONNECTION POOL STATUS ===");
        System.out.println("Available connections: " + connectionPool.size());
        System.out.println("Total connections created: " + totalConnectionsCreated.get());
        System.out.println("Connections in use: " + connectionsInUse.get());
        System.out.println("Max pool size: " + MAX_POOL_SIZE);
        System.out.println("Connection timeout: " + CONNECTION_TIMEOUT_SECONDS + " seconds");
        
        // Check for potential connection leaks
        if (connectionsInUse.get() > totalConnectionsCreated.get()) {
            System.err.println("WARNING: Connection leak detected! In use > Total created");
        }
        
        if (connectionsInUse.get() == totalConnectionsCreated.get() && connectionsInUse.get() == MAX_POOL_SIZE) {
            System.err.println("WARNING: All connections are in use! Possible connection leak.");
        }
    }
    
    /**
     * Get pool metrics for monitoring
     */
    public static void logPoolStatus() {
        System.out.println(getPoolStatus());
    }
    
    /**
     * Force release stale connections (emergency use)
     */
    public static void forceCleanup() {
        System.out.println("Forcing connection pool cleanup...");
        cleanupStaleConnections();
        logDetailedPoolStatus();
    }
} 