.libPaths("/home/andeek/R/library")
addResourcePath('images', '~/ShinyApps/DevNetworkGraph/images')
#addResourcePath('data', '~/ShinyApps/DevNetworkGraph/data')
#addResourcePath('images', '/var/shiny-server/www/D3/Network\ Graph/images') 
#addResourcePath('images', 'U:/Documents/Projects/Community-Detection/Prototype\ D3-Shiny/Network\ Graph/images')
#addResourcePath('images', '~/Documents/Projects/Community-Detection/Prototype\ D3-Shiny/Network\ Graph/images')

library(plyr)

#data_sets <- c("data/football.gml", "data/karate.gml")
#layouts <- c("force")
data_sets <- paste("data/", list.files("data/", pattern="*.gml"), sep="")

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
  #output$choose_layout <- reactiveUI(function() {
    # If missing input, return to avoid error later in function
  #  if(is.null(input$dataset)) return()
  #  selectInput("layout", "Graph Layout", as.list(layouts))
  #})
  
  data <- reactive({
    #if(is.null(input$dataset) | is.null(input$layout))
    if(is.null(input$dataset))
      return()
    
    supported_formats<-c("gml")
    if(tolower(strsplit(input$dataset, "\\.")[[1]][2]) %in% supported_formats) {
      #return(list(data_json=GraphMLtoJSON(getXMLfromFile(input$dataset)), layout=input$layout))
      return(list(data_json=GraphMLtoJSON(getXMLfromFile(input$dataset))))
    } else {
      return()  
    }
  })
  output$d3io <- reactive({ data() })
  
  datasetInput <- reactive({
    empty<-data.frame(Within=0, Outside=0, row.names="Connections")
    
    if(names(input)[1] == "d3io") {
      nodes<-ldply(input[[names(input)[names(input) == "d3io"]]]["nodes"][[1]], function(x) data.frame(x[c("_count","group","id","index","selected","weight")]))
      nodes_t<-input[[names(input)[names(input) == "d3io"]]]["nodes"][[1]]
      edges_t<-input[[names(input)[names(input) == "d3io"]]]["links"][[1]]
      save(nodes_t, edges_t, file="data/input.RData")
      if("selected" %in% names(nodes)) { 
        nodes_selected<-as.character(subset(nodes, selected == 1)$id)
        edges<-ldply(input[[names(input)[names(input) == "d3io"]]]["links"][[1]], function(x) data.frame(c(x[["source"]][c("id", "selected")], x[["target"]][c("id", "selected")])))
        names(edges) <- c("source.id", "source.selected", "target.id", "target.selected")
        if(nrow(edges) > 0) {
          edges_selected<-subset(edges, source.selected == 1 | target.selected == 1)
          within_selected<-subset(edges_selected, as.character(source.id) %in% nodes_selected & as.character(target.id) %in% nodes_selected)
          n_total_selected<-nrow(edges_selected)
          n_within_selected<-nrow(within_selected)
        } else {
          n_total_selected<-0
          n_within_selected<-0
        }

        
        return(data.frame(Within=n_within_selected, Outside=n_total_selected - n_within_selected, row.names="Connections"))
      } else {
        return(empty)
      }
    } else {
      return(empty)
    }   
  })
  
  output$d3summary <- renderTable({dataset <- datasetInput()
                                   print(dataset)}, digits=0)
   
  
})
