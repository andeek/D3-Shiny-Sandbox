data_sets <- c("mtcars", "morley", "rock")

shinyServer(function(input, output) {
  
  # Drop-down selection box for which data set
  output$choose_dataset <- reactiveUI(function() {
    selectInput("dataset", "Data set", as.list(data_sets))
  })
  
  # X, Y variables
  output$choose_x <- reactiveUI(function() {
    # If missing input, return to avoid error later in function
    if(is.null(input$dataset))
      return()
    
    # Get the data set with the appropriate name
    dat <- get(input$dataset)
    colnames <- names(sapply(dat, is.numeric))
    
    # Create the dropdown for choosing x
    selectInput("x", "X value", as.list(colnames))
  })
  
  output$choose_y <- reactiveUI(function() {
    # If missing input, return to avoid error later in function
    if(is.null(input$dataset))
      return()
    
    # Get the data set with the appropriate name
    dat <- get(input$dataset)
    colnames <- names(dat)
    
    # Create the dropdown for choosing x
    selectInput("y", "Y value", as.list(colnames))    
  })
  
  data <- reactive(function() {
    if(is.null(input$dataset))
      return()
    
    dat <- get(input$dataset)
    
    #Make sure columns are correct for data set (when data set changes, the
    # columns will initially be for the previous data set)
    if (is.null(input$x) || !(input$x %in% names(dat)) || is.null(input$y) || !(input$y %in% names(dat)))
      return()
    
    # Keep the selected columns
    list(names=c(input$x, input$y), 
         df=data.frame(x=dat[,input$x], y=dat[,input$y]))    
  })
  
  
  output$perfplot <- reactive(function() { data() })
})