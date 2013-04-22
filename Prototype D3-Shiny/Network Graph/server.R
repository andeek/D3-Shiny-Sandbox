.libPaths("/home/andeek/R/library")
addResourcePath('images', '~/ShinyApps/NetworkGraph/images')
#addResourcePath('images', '/var/shiny-server/www/D3/Network\ Graph/images') 
#addResourcePath('images', 'U:/Documents/Projects/Community-Detection/Prototype\ D3-Shiny/Network\ Graph/images')
#addResourcePath('images', '~/Documents/Projects/Community-Detection/Prototype\ D3-Shiny/Network\ Graph/images')

library(plyr)

data_sets <- c("data/football.gml", "data/karate.gml")
layouts <- c("force")

getXMLfromFile <- function(file) {
  require(igraph)
  graph<-read.graph(file, format="gml")
  write.graph(graph, paste(strsplit(file, "\\.")[[1]][1], ".xml", sep=""), format="graphml")
  return(paste(strsplit(file, "\\.")[[1]][1], ".xml", sep=""))
}

shinyServer(function(input, output) {
  source("code/GraphMLtoJSON.R")
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
  
  data <- reactive({
    if(is.null(input$dataset) | is.null(input$layout))
      return()
    
    supported_formats<-c("gml")
    if(tolower(strsplit(input$dataset, "\\.")[[1]][2]) %in% supported_formats) {
      return(list(data_json=GraphMLtoJSON(getXMLfromFile(input$dataset)), layout=input$layout))
    } else {
      return()  
    }
  })
  output$d3io <- reactive({ data() })
  
  datasetInput <- reactive({
    if(names(input)[1] == "d3io"){
      nodes_selected<-subset(ldply(input[[names(input)[names(input) == "d3io"]]][1][[1]], data.frame), selected == 1)$id
      edges<-ldply(input[[names(input)[names(input) == "d3io"]]][2][[1]], data.frame)
      edges_selected<-subset(edges, source.selected == 1 | target.selected == 1)
      within_selected<-subset(edges_selected, source.id %in% nodes_selected & target.id %in% nodes_selected)
      
      n_total_selected<-nrow(edges_selected)
      n_within_selected<-nrow(within_selected)
      
      return(data.frame(Within=n_within_selected, Outside=n_total_selected - n_within_selected, row.names="Connections"))
    } else {
      return(data.frame(Within=0, Outside=0, row.names="Connections"))
    }   
  })
  
  output$d3summary <- renderTable({dataset <- datasetInput()
                                   print(dataset)}, digits=0)
   
  
})
