.libPaths("/home/andeek/R/library")
source("code/GraphMLtoJSON.R")

data_sets <- c("data/football.gml", "data/karate.gml")
layouts <- c("force")

shinyServer(function(input, output) {
  
  # Drop-down selection box for which data set
  output$choose_dataset <- reactiveUI(function() {
    selectInput("dataset", "Data set", as.list(data_sets))
  })
  
  # Layouts
  output$choose_layout <- reactiveUI(function() {
    # If missing input, return to avoid error later in function
    if(is.null(input$dataset)) return()
    selectInput("layout", "Graph Layout", as.list(layouts))
  })
  
  getXMLfromFile <- function(file) {
    require(igraph)
    graph<-read.graph(file, format="gml")
    write.graph(graph, paste(strsplit(file, "\\.")[[1]][1], ".xml", sep=""), format="graphml")
    return(paste(strsplit(file, "\\.")[[1]][1], ".xml", sep=""))
  }
  
  data <- reactive(function() {
    if(is.null(input$dataset) | is.null(input$layout))
      return()
    
    supported_formats<-c("gml")
    if(tolower(strsplit(input$dataset, "\\.")[[1]][2]) %in% supported_formats) {
      return(list(data_json=GraphMLtoJSON(getXMLfromFile(input$dataset)), layout=input$layout))
    } else {
      return()  
    }
  })
  
  
  output$perfplot <- reactive(function() { data() })
})
